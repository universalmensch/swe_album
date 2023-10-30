/**
 * Das Modul besteht aus der Klasse {@linkcode AlbumReadService}.
 * @packageDocumentation
 */

import { Album, type Genre } from '../entity/album.entity.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBuilder } from './query-builder.js';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';

/**
 * Typdefinition für `findById`
 */
export interface FindByIdParams {
    /** ID des gesuchten Albums */
    readonly id: number;
    /** Sollen die Lieder mitgeladen werden? */
    readonly mitLieder?: boolean;
}

export interface Suchkriterien {
    readonly genre?: Genre;
    readonly name?: string;
    readonly titelbild?: string;
    readonly kuenstler?: string;
    readonly javascript?: string;
    readonly typescript?: string;
}

/**
 * Die Klasse `AlbumReadService` implementiert das Lesen für Alben und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class AlbumReadService {
    static readonly ID_PATTERN = new RE2('^[1-9][\\d]*$');

    readonly #queryBuilder: QueryBuilder;

    readonly #albumProps: string[];

    readonly #logger = getLogger(AlbumReadService.name);

    constructor(queryBuilder: QueryBuilder) {
        const albumDummy = new Album();
        this.#albumProps = Object.getOwnPropertyNames(albumDummy);
        this.#queryBuilder = queryBuilder;
    }

    async findById({ id, mitLieder = false }: FindByIdParams) {
        this.#logger.debug('findById: id=%d', id);

        const album = await this.#queryBuilder
            .buildId({ id, mitLieder })
            .getOne();
        if (album === null) {
            throw new NotFoundException(`Es gibt kein Album mit der ID ${id}.`);
        }

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: album=%s, künstler=%o',
                album.toString(),
                album.kuenstler,
            );
            if (mitLieder) {
                this.#logger.debug('findById: lieder=%o', album.lieder);
            }
        }
        return album;
    }

    /**
     * Alben asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns Ein JSON-Array mit den gefundenen Alben.
     * @throws NotFoundException falls keine Alben gefunden wurden.
     */
    async find(suchkriterien?: Suchkriterien) {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        if (suchkriterien === undefined) {
            return this.#queryBuilder.build({}).getMany();
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#queryBuilder.build(suchkriterien).getMany();
        }

        if (!this.#checkKeys(keys)) {
            throw new NotFoundException('Ungueltige Suchkriterien');
        }

        const alben = await this.#queryBuilder.build(suchkriterien).getMany();
        this.#logger.debug('find: alben=%o', alben);
        if (alben.length === 0) {
            throw new NotFoundException(
                `Keine Alben gefunden: ${JSON.stringify(suchkriterien)}`,
            );
        }

        return alben;
    }

    #checkKeys(keys: string[]) {
        let validKeys = true;
        keys.forEach((key) => {
            if (
                !this.#albumProps.includes(key) &&
                key !== 'javascript' &&
                key !== 'typescript'
            ) {
                this.#logger.debug(
                    '#find: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
