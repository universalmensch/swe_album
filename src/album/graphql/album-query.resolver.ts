import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseFilters, UseInterceptors } from '@nestjs/common';
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

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: album=%s, kuenstler=%o',
                album.toString(),
                album.kuenstler,
            );
        }
        return album;
    }

    @Query('alben')
    async find(@Args() kuenstler: { kuenstler: string } | undefined) {
        const kuenstlerStr = kuenstler?.kuenstler;
        this.#logger.debug('find: Suchkriterium kuenstler=%s', kuenstlerStr);
        // eslint-disable-next-line max-len, prettier/prettier
        const suchkriterium = kuenstlerStr === undefined ? {} : { kuenstler: kuenstlerStr };

        const alben = await this.#service.find(suchkriterium);

        this.#logger.debug('find: alben=%o', alben);
        return alben;
    }
}
