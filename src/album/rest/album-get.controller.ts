/**
 * Das Modul besteht aus der Controller-Klasse für Lesen an der REST-Schnittstelle.
 * @packageDocumentation
 */

// eslint-disable-next-line max-classes-per-file
import {
    AlbumReadService,
    type Suchkriterien,
} from '../service/album-read.service.js';
import {
    ApiHeader,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiProperty,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Controller,
    Get,
    Headers,
    HttpStatus,
    Param,
    Query,
    Req,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { type Album } from '../entity/album.entity.js';
import { Genre } from '../entity/album.entity';
import { type Kuenstler } from '../entity/kuenstler.entity.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';

export interface Link {
    readonly href: string;
}

export interface Links {
    readonly self: Link;
    readonly list?: Link;
    readonly add?: Link;
    readonly update?: Link;
    readonly remove?: Link;
}

export type KuenstlerModel = Omit<Kuenstler, 'album' | 'id'>;

export type AlbumModel = Omit<
    Album,
    'lieder' | 'aktualisiert' | 'erzeugt' | 'id' | 'kuenstler' | 'version'
> & {
    kuenstler: KuenstlerModel;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _links: Links;
};

export interface AlbenModel {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _embedded: {
        alben: AlbumModel[];
    };
}

export class AlbumQuery implements Suchkriterien {
    @ApiProperty({ required: false })
    declare readonly name: string;

    @ApiProperty({ required: false })
    declare readonly genre: Genre;

    @ApiProperty({ required: false })
    declare readonly titelbild: string;
}

const APPLICATION_HAL_JSON = 'application/hal+json';

@Controller(paths.rest)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Album REST-API')
export class AlbumGetController {
    readonly #service: AlbumReadService;

    readonly #logger = getLogger(AlbumGetController.name);

    constructor(service: AlbumReadService) {
        this.#service = service;
    }

    /**
     * @param id Pfad-Parameter `id`
     * @param req Request-Objekt von Express
     *            Request-Header und Request-Body.
     * @param version Versionsnummer im Request-Header bei `If-None-Match`
     * @param accept Content-Type bzw. MIME-Type
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    // eslint-disable-next-line max-params
    @Get(':id')
    @ApiOperation({ summary: 'Suche mit der Album-ID' })
    @ApiParam({
        name: 'id',
        description: 'Z.B. 1',
    })
    @ApiHeader({
        name: 'If-None-Match',
        description: 'Header für bedingte GET-Requests, z.B. "0"',
        required: false,
    })
    @ApiOkResponse({ description: 'Das Album wurde gefunden' })
    @ApiNotFoundResponse({ description: 'Kein Album zur ID gefunden' })
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Das Album wurde bereits heruntergeladen',
    })
    async getById(
        @Param('id') idStr: string,
        @Req() req: Request,
        @Headers('If-None-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response<AlbumModel | undefined>> {
        this.#logger.debug('getById: idStr=%s, version=%s"', idStr, version);
        const id = Number(idStr);
        if (Number.isNaN(id)) {
            this.#logger.debug('getById: NaN');
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }

        if (req.accepts([APPLICATION_HAL_JSON, 'json', 'html']) === false) {
            this.#logger.debug('getById: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const album = await this.#service.findById({ id });
        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug('getById(): album=%s', album.toString());
            this.#logger.debug('getById(): kuenstler=%o', album.kuenstler);
        }

        const versionDb = album.version;
        if (version === `"${versionDb}"`) {
            this.#logger.debug('getById: NOT_MODIFIED');
            return res.sendStatus(HttpStatus.NOT_MODIFIED);
        }
        this.#logger.debug('getById: versionDb=%s', versionDb);
        res.header('ETag', `"${versionDb}"`);

        const albumModel = this.#toModel(album, req);
        this.#logger.debug('getById: albumModel=%o', albumModel);
        return res.contentType(APPLICATION_HAL_JSON).json(albumModel);
    }

    /**
     * @param query Query-Parameter von Express.
     * @param req Request-Objekt von Express.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Get()
    @ApiOperation({ summary: 'Suche mit Suchkriterien' })
    @ApiOkResponse({ description: 'Eine evtl. leere Liste mit Alben' })
    async get(
        @Query() query: AlbumQuery,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<AlbenModel | undefined>> {
        this.#logger.debug('get: query=%o', query);

        if (req.accepts([APPLICATION_HAL_JSON, 'json', 'html']) === false) {
            this.#logger.debug('get: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const alben = await this.#service.find(query);
        this.#logger.debug('get: %o', alben);

        const albenModel = alben.map((album) =>
            this.#toModel(album, req, false),
        );
        this.#logger.debug('get: albenModel=%o', albenModel);

        const result: AlbenModel = { _embedded: { alben: albenModel } };
        return res.contentType(APPLICATION_HAL_JSON).json(result).send();
    }

    #toModel(album: Album, req: Request, all = true) {
        const baseUri = getBaseUri(req);
        this.#logger.debug('#toModel: baseUri=%s', baseUri);
        const { id } = album;
        const links = all
            ? {
                  self: { href: `${baseUri}/${id}` },
                  list: { href: `${baseUri}` },
                  add: { href: `${baseUri}` },
                  update: { href: `${baseUri}/${id}` },
                  remove: { href: `${baseUri}/${id}` },
              }
            : { self: { href: `${baseUri}/${id}` } };

        this.#logger.debug('#toModel: album=%o, links=%o', album, links);
        const kuenstlerModel: KuenstlerModel = {
            name: album.kuenstler?.name ?? 'N/A', // eslint-disable-line unicorn/consistent-destructuring
            vorname: album.kuenstler?.vorname ?? 'N/A', // eslint-disable-line unicorn/consistent-destructuring
            alter: album.kuenstler?.alter ?? undefined, // eslint-disable-line unicorn/consistent-destructuring
        };
        /* eslint-disable unicorn/consistent-destructuring */
        const albumModel: AlbumModel = {
            name: album.name,
            genre: album.genre,
            titelbild: album.titelbild,
            kuenstler: kuenstlerModel,
            _links: links,
        };
        /* eslint-enable unicorn/consistent-destructuring */

        return albumModel;
    }
}
