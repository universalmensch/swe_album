import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { type Album } from '../entity/album.entity.js';
import { AlbumDTO } from '../rest/albumDTO.entity.js';
import { AlbumWriteService } from '../service/album-write.service.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { JwtAuthGraphQlGuard } from '../../security/auth/jwt/jwt-auth-graphql.guard.js';
import { type Kuenstler } from '../entity/kuenstler.entity.js';
import { type Lied } from '../entity/lied.entity.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { RolesAllowed } from '../../security/auth/roles/roles-allowed.decorator.js';
import { RolesGraphQlGuard } from '../../security/auth/roles/roles-graphql.guard.js';
import { getLogger } from '../../logger/logger.js';

export interface CreatePayload {
    readonly id: number;
}

@Resolver()
@UseGuards(JwtAuthGraphQlGuard, RolesGraphQlGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class AlbumMutationResolver {
    readonly #service: AlbumWriteService;

    readonly #logger = getLogger(AlbumMutationResolver.name);

    constructor(service: AlbumWriteService) {
        this.#service = service;
    }

    @Mutation()
    @RolesAllowed('admin')
    async create(@Args('input') albumDTO: AlbumDTO) {
        this.#logger.debug('create: albumDTO=%o', albumDTO);

        const album = this.#albumDtoToAlbum(albumDTO);
        const id = await this.#service.create(album);
        this.#logger.debug('createAlbum: id=%d', id);
        const payload: CreatePayload = { id };
        return payload;
    }

    #albumDtoToAlbum(albumDTO: AlbumDTO): Album {
        const kuenstlerDTO = albumDTO.kuenstler;
        const kuenstler: Kuenstler = {
            id: undefined,
            name: kuenstlerDTO.name,
            vorname: kuenstlerDTO.vorname,
            alter: kuenstlerDTO.alter,
            album: undefined,
        };
        const lieder = albumDTO.lieder?.map((liedDTO) => {
            const lied: Lied = {
                id: undefined,
                name: liedDTO.name,
                dauerInSekunden: liedDTO.dauerInSekunden,
                album: undefined,
            };
            return lied;
        });
        const album: Album = {
            id: undefined,
            version: undefined,
            genre: albumDTO.genre,
            name: albumDTO.name,
            titelbild: albumDTO.titelbild,
            kuenstler,
            lieder,
            erzeugt: undefined,
            aktualisiert: undefined,
        };

        album.kuenstler!.album = album;
        return album;
    }
}
