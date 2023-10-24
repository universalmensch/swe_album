/**
 * Das Modul besteht aus der Klasse {@linkcode AlbumReadService}.
 * @packageDocumentation
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBuilder } from './query-builder.js';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';

/**
 * Typdefinition für `findById`
 */
export interface FindByIdParams {
    /** ID des gesuchten Buchs */
    readonly id: number;
    /** Sollen die Lieder mitgeladen werden? */
    readonly mitLieder?: boolean;
}

/**
 * Die Klasse `AlbumReadService` implementiert das Lesen für Alben und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class AlbumReadService {
    static readonly ID_PATTERN = new RE2('^[1-9][\\d]*$');

    readonly #queryBuilder: QueryBuilder;

    readonly #logger = getLogger(AlbumReadService.name);

    constructor(queryBuilder: QueryBuilder) {
        this.#queryBuilder = queryBuilder;
    }

    async findById({ id, mitLieder = false }: FindByIdParams) {
        this.#logger.debug('findById: id=%d', id);

        // https://typeorm.io/working-with-repository
        // Das Resultat ist undefined, falls kein Datensatz gefunden
        // Lesen: Keine Transaktion erforderlich
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
                album.künstler,
            );
            if (mitLieder) {
                this.#logger.debug(
                    'findById: abbildungen=%o',
                    album.lieder,
                );
            }
        }
        return album;
    }
}
