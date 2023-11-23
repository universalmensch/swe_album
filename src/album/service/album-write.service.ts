/**
 * Das Modul besteht aus der Klasse {@linkcode AlbumWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */

import { type DeleteResult, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
    VersionInvalidException,
    VersionOutdatedException,
} from './exceptions.js';
import { Album } from '../entity/album.entity.js';
import { AlbumReadService } from './album-read.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Kuenstler } from '../entity/kuenstler.entity.js';
import { Lied } from '../entity/lied.entity.js';
import { MailService } from '../../mail/mail.service.js';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';

/** Typdefinitionen zum Aktualisieren eines Albums mit `update`. */
export interface UpdateParams {
    readonly id: number | undefined;
    readonly album: Album;
    readonly version: string;
}

/**
 * Die Klasse `AlbumWriteService` implementiert den Anwendungskern für das
 * Schreiben von Alben und greift mit _TypeORM_ auf die DB zu.
 */
@Injectable()
export class AlbumWriteService {
    private static readonly VERSION_PATTERN = new RE2('^"\\d*"');

    readonly #repo: Repository<Album>;

    readonly #readService: AlbumReadService;

    readonly #mailService: MailService;

    readonly #logger = getLogger(AlbumWriteService.name);

    constructor(
        @InjectRepository(Album) repo: Repository<Album>,
        readService: AlbumReadService,
        mailService: MailService,
    ) {
        this.#repo = repo;
        this.#readService = readService;
        this.#mailService = mailService;
    }

    /**
     * Ein neues Album soll angelegt werden.
     * @param album Das neu anzulegende Album
     * @returns Die ID des neu angelegten Albums
     */
    async create(album: Album): Promise<number> {
        this.#logger.debug('create: album=%o', album);

        const albumDb = await this.#repo.save(album);
        this.#logger.debug('create: albumDb=%o', albumDb);

        await this.#sendmail(albumDb);

        return albumDb.id!;
    }

    /**
     * Ein vorhandenes Album soll aktualisiert werden.
     * @param album Das zu aktualisierende Album
     * @param id ID des zu aktualisierenden Albums
     * @param version Die Versionsnummer für optimistische Synchronisation
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation
     * @throws VersionInvalidException falls die Versionsnummer ungültig ist
     * @throws VersionOutdatedException falls die Versionsnummer veraltet ist
     */
    async update({ id, album, version }: UpdateParams): Promise<number> {
        this.#logger.debug(
            'update: id=%d, album=%o, version=%s',
            id,
            album,
            version,
        );
        if (id === undefined) {
            this.#logger.debug('update: Keine gueltige ID');
            throw new NotFoundException(`Es gibt kein Album mit der ID ${id}.`);
        }

        const validateResult = await this.#validateUpdate(album, id, version);
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Album)) {
            return validateResult;
        }

        const albumNeu = validateResult;
        const merged = this.#repo.merge(albumNeu, album);
        this.#logger.debug('update: merged=%o', merged);
        const updated = await this.#repo.save(merged);
        this.#logger.debug('update: updated=%o', updated);

        return updated.version!;
    }

    /**
     * Ein Album wird asynchron anhand seiner ID gelöscht.
     * @param id ID des zu löschenden Albums
     * @returns true, falls das Album vorhanden war und gelöscht wurde. Sonst false.
     */
    async delete(id: number) {
        this.#logger.debug('delete: id=%d', id);
        const album = await this.#readService.findById({
            id,
            mitLieder: true,
        });

        let deleteResult: DeleteResult | undefined;
        await this.#repo.manager.transaction(async (transactionalMgr) => {
            const kuenstlerId = album.kuenstler?.id;
            if (kuenstlerId !== undefined) {
                await transactionalMgr.delete(Kuenstler, kuenstlerId);
            }
            const lieder = album.lieder ?? [];
            for (const lied of lieder) {
                await transactionalMgr.delete(Lied, lied.id);
            }

            deleteResult = await transactionalMgr.delete(Album, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });

        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }

    async #sendmail(album: Album) {
        const subject = `Neues Album ${album.id}`;
        const name = album.kuenstler?.name ?? 'N/A';
        const body = `Das Album von dem Kuenstler <strong>${name}</strong> ist angelegt`;
        await this.#mailService.sendmail({ subject, body });
    }

    async #validateUpdate(
        album: Album,
        id: number,
        versionStr: string,
    ): Promise<Album> {
        const version = this.#validateVersion(versionStr);
        this.#logger.debug(
            '#validateUpdate: album=%o, version=%s',
            album,
            version,
        );

        const resultFindById = await this.#findByIdAndCheckVersion(id, version);
        this.#logger.debug('#validateUpdate: %o', resultFindById);
        return resultFindById;
    }

    #validateVersion(version: string | undefined): number {
        this.#logger.debug('#validateVersion: version=%s', version);
        if (
            version === undefined ||
            !AlbumWriteService.VERSION_PATTERN.test(version)
        ) {
            throw new VersionInvalidException(version);
        }

        return Number.parseInt(version.slice(1, -1), 10);
    }

    async #findByIdAndCheckVersion(
        id: number,
        version: number,
    ): Promise<Album> {
        const albumDb = await this.#readService.findById({ id });

        const versionDb = albumDb.version!;
        if (version < versionDb) {
            this.#logger.debug(
                '#checkIdAndVersion: VersionOutdated=%d',
                version,
            );
            throw new VersionOutdatedException(version);
        }

        return albumDb;
    }
}
