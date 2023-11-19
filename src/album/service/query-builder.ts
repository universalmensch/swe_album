/**
 * Das Modul besteht aus der Klasse {@linkcode QueryBuilder}.
 * @packageDocumentation
 */

import { Album } from '../entity/album.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Kuenstler } from '../entity/kuenstler.entity.js';
import { Lied } from '../entity/lied.entity.js';
import { Repository } from 'typeorm';
import { type Suchkriterien } from './album-read.service.js';
import { getLogger } from '../../logger/logger.js';
import { typeOrmModuleOptions } from '../../config/db.js';

/** Typdefinitionen für die Suche mit der Album-ID. */
export interface BuildIdParams {
    /** ID des gesuchten Albums. */
    readonly id: number;
    /** Sollen die Lieder mitgeladen werden? */
    readonly mitLieder?: boolean;
}

/**
 * Die Klasse `QueryBuilder` implementiert das Lesen für Alben und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class QueryBuilder {
    readonly #albumAlias = `${Album.name
        .charAt(0)
        .toLowerCase()}${Album.name.slice(1)}`;

    readonly #kuenstlerAlias = `${Kuenstler.name
        .charAt(0)
        .toLowerCase()}${Kuenstler.name.slice(1)}`;

    readonly #liedAlias = `${Lied.name
        .charAt(0)
        .toLowerCase()}${Lied.name.slice(1)}`;

    readonly #repo: Repository<Album>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Album) repo: Repository<Album>) {
        this.#repo = repo;
    }

    buildId({ id, mitLieder = false }: BuildIdParams) {
        const queryBuilder = this.#repo.createQueryBuilder(this.#albumAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#albumAlias}.kuenstler`,
            this.#kuenstlerAlias,
        );
        if (mitLieder) {
            queryBuilder.leftJoinAndSelect(
                `${this.#albumAlias}.lieder`,
                this.#liedAlias,
            );
        }
        queryBuilder.where(`${this.#albumAlias}.id = :id`, { id });
        return queryBuilder;
    }

    /**
     * Alben asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns QueryBuilder
     */
    build({ kuenstler, ...props }: Suchkriterien) {
        this.#logger.debug('build: kuenstler=%s, props=%o', kuenstler, props);

        let queryBuilder = this.#repo.createQueryBuilder(this.#albumAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#albumAlias}.kuenstler`,
            'kuenstler',
        );

        let useWhere = true;

        // Titel in der Query: Teilstring des Titels und "case insensitive"
        // CAVEAT: MySQL hat keinen Vergleich mit "case insensitive"
        // type-coverage:ignore-next-line
        if (kuenstler !== undefined && typeof kuenstler === 'string') {
            const ilike =
                typeOrmModuleOptions.type === 'postgres' ? 'ilike' : 'like';
            queryBuilder = queryBuilder.where(
                `${this.#kuenstlerAlias}.kuenstler ${ilike} :kuenstler`,
                { kuenstler: `%${kuenstler}%` },
            );
            useWhere = false;
        }

        Object.keys(props).forEach((key) => {
            const param: Record<string, any> = {};
            param[key] = (props as Record<string, any>)[key]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, security/detect-object-injection
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#albumAlias}.${key} = :${key}`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#albumAlias}.${key} = :${key}`,
                      param,
                  );
            useWhere = false;
        });

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }
}
