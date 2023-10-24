/**
 * Das Modul besteht aus der Klasse {@linkcode QueryBuilder}.
 * @packageDocumentation
 */

import { Album } from '../entity/album.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Künstler } from '../entity/künstler.entity.js';
import { Lied } from '../entity/lied.entity.js';
import { Repository } from 'typeorm';

/** Typdefinitionen für die Suche mit der Buch-ID. */
export interface BuildIdParams {
    /** ID des gesuchten Buchs. */
    readonly id: number;
    /** Sollen die Abbildungen mitgeladen werden? */
    readonly mitLieder?: boolean;
}

/**
 * Die Klasse `QueryBuilder` implementiert das Lesen für Bücher und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class QueryBuilder {
    readonly #albumAlias = `${Album.name
        .charAt(0)
        .toLowerCase()}${Album.name.slice(1)}`;

    readonly #künstlerAlias = `${Künstler.name
        .charAt(0)
        .toLowerCase()}${Künstler.name.slice(1)}`;

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
            this.#künstlerAlias,
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
