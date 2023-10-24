import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Logger, UseFilters, UseInterceptors } from '@nestjs/common';
import { Album } from '../entity/album.entity.js';
import { AlbumReadService } from '../service/album-read.service.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getLogger } from '../../logger/logger.js';

export interface IdInput {
    readonly id: number;
}

@Resolver((_: any) => Album)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class AlbumQueryResolver {
    readonly #service: AlbumReadService;

    readonly #logger = getLogger(AlbumQueryResolver.name);

    constructor(service: AlbumReadService) {
        this.#service = service;
    }

    @Query('album')
    async findById(@Args() idInput: IdInput) {
        const { id } = idInput;
        this.#logger.debug('findById: id=%d', id);

        const album = await this.#service.findById({ id });

        return album;
    }
}
