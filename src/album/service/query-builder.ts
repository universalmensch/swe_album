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

    constructor(@InjectRepository(Album) repo: Repository<Album>) {
        this.#repo = repo;
    }

    buildId({ id, mitLieder = false }: BuildIdParams) {
        const queryBuilder = this.#repo.createQueryBuilder(this.#albumAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#albumAlias}.künstler`,
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
}
