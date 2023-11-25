/**
 * Das Modul besteht aus der Controller-Klasse für Schreiben an der REST-Schnittstelle.
 * @packageDocumentation
 */

import { AlbumDTO, AlbumDtoOhneRef } from './albumDTO.entity.js';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiHeader,
    ApiNoContentResponse,
    ApiOperation,
    ApiPreconditionFailedResponse,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { type Album } from '../entity/album.entity.js';
import { AlbumWriteService } from '../service/album-write.service.js';
import { JwtAuthGuard } from '../../security/auth/jwt/jwt-auth.guard.js';
import { type Kuenstler } from '../entity/kuenstler.entity.js';
import { type Lied } from '../entity/lied.entity.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { RolesAllowed } from '../../security/auth/roles/roles-allowed.decorator.js';
import { RolesGuard } from '../../security/auth/roles/roles.guard.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';

const MSG_FORBIDDEN = 'Kein Token mit ausreichender Berechtigung vorhanden';
@Controller(paths.rest)
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Album REST-API')
@ApiBearerAuth()
export class AlbumWriteController {
    readonly #service: AlbumWriteService;

    readonly #logger = getLogger(AlbumWriteController.name);

    constructor(service: AlbumWriteService) {
        this.#service = service;
    }

    /**
     * @param album JSON-Daten für ein Album im Request-Body.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Post()
    @RolesAllowed('admin', 'musikredakteur')
    @ApiOperation({ summary: 'Ein neues Album anlegen' })
    @ApiCreatedResponse({ description: 'Erfolgreich neu angelegt' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Albumdaten' })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async post(
        @Body() albumDTO: AlbumDTO,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug('post: albumDTO=%o', albumDTO);

        const album = this.#albumDtoToAlbum(albumDTO);
        const result = await this.#service.create(album);

        const location = `${getBaseUri(req)}/${result}`;
        this.#logger.debug('post: location=%s', location);
        return res.location(location).send();
    }

    /**
     * @param album Albumdaten im Body des Request-Objekts.
     * @param id Pfad-Paramater für die ID.
     * @param version Versionsnummer aus dem Header _If-Match_.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    // eslint-disable-next-line max-params
    @Put(':id')
    @RolesAllowed('admin', 'musikredakteur')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Ein vorhandenes Album aktualisieren',
        tags: ['Aktualisieren'],
    })
    @ApiHeader({
        name: 'If-Match',
        description: 'Header für optimistische Synchronisation',
        required: false,
    })
    @ApiNoContentResponse({ description: 'Erfolgreich aktualisiert' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Albumdaten' })
    @ApiPreconditionFailedResponse({
        description: 'Falsche Version im Header "If-Match"',
    })
    @ApiResponse({
        status: HttpStatus.PRECONDITION_REQUIRED,
        description: 'Header "If-Match" fehlt',
    })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async put(
        @Body() albumDTO: AlbumDtoOhneRef,
        @Param('id') id: number,
        @Headers('If-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug(
            'put: id=%s, albumDTO=%o, version=%s',
            id,
            albumDTO,
            version,
        );

        if (version === undefined) {
            const msg = 'Header "If-Match" fehlt';
            this.#logger.debug('put: msg=%s', msg);
            return res
                .status(HttpStatus.PRECONDITION_REQUIRED)
                .set('Content-Type', 'application/json')
                .send(msg);
        }

        const album = this.#albumDtoOhneRefToAlbum(albumDTO);
        const neueVersion = await this.#service.update({ id, album, version });
        this.#logger.debug('put: version=%d', neueVersion);
        return res.header('ETag', `"${neueVersion}"`).send();
    }

    /**
     * @param id Pfad-Paramater für die ID.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Delete(':id')
    @RolesAllowed('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Album mit der ID löschen' })
    @ApiNoContentResponse({
        description: 'Das Album wurde gelöscht oder war nicht vorhanden',
    })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async delete(@Param('id') id: number) {
        this.#logger.debug('delete: id=%s', id);
        await this.#service.delete(id);
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
        const album = {
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

        album.kuenstler.album = album;
        album.lieder?.forEach((lied) => {
            lied.album = album;
        });
        return album;
    }

    #albumDtoOhneRefToAlbum(albumDTO: AlbumDtoOhneRef): Album {
        return {
            id: undefined,
            version: undefined,
            genre: albumDTO.genre,
            name: albumDTO.name,
            titelbild: albumDTO.titelbild,
            kuenstler: undefined,
            lieder: undefined,
            erzeugt: undefined,
            aktualisiert: undefined,
        };
    }
}
