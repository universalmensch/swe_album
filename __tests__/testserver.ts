import {
    HttpStatus,
    type INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Agent } from 'node:https';
import { AppModule } from '../src/app.module.js';
import { NestFactory } from '@nestjs/core';
import { v2 as compose } from 'docker-compose';
import { config } from '../src/config/app.js';
import { dbType } from '../src/config/dbtype.js';
import { env } from '../src/config/env.js';
import isPortReachable from 'is-port-reachable';
import { join } from 'node:path';
import { nodeConfig } from '../src/config/node.js';
import { paths } from '../src/config/paths.js';
import { typeOrmModuleOptions } from '../src/config/db.js';

export const loginPath = `${paths.auth}/${paths.login}`;

export const { host, port } = nodeConfig;

const { httpsOptions } = nodeConfig;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const dbPort: number = (typeOrmModuleOptions as any).port;
const dockerComposeDir = join('.extras', 'compose');

let dbHealthCheck: string;
switch (dbType) {
    case 'postgres': {
        dbHealthCheck = 'until pg_isready ; do sleep 1; done';
        break;
    }
    case 'mysql': {
        dbHealthCheck = 'until ping ; do sleep 1; done';
        break;
    }
    case 'sqlite': {
        dbHealthCheck = '';
        break;
    }
    default: {
        throw new Error('Der DB-Container wird nicht unterstuetzt');
    }
}

const startDbServer = async () => {
    if (dbType === 'sqlite') {
        return;
    }
    const isDBReachable = await isPortReachable(dbPort, { host: 'localhost' });
    if (isDBReachable) {
        return;
    }

    try {
        await compose.upAll({
            cwd: dockerComposeDir,
            commandOptions: [dbType],
            composeOptions: [['-f', `compose.${dbType}.yml`]],
            log: true,
        });
    } catch (err: unknown) {
        console.error(`startDbServer: ${JSON.stringify(err)}`);
        return;
    }

    await compose.exec(dbType, ['sh', '-c', dbHealthCheck], {
        cwd: dockerComposeDir,
    });
};

const shutdownDbServer = async () => {
    if (dbType === 'sqlite') {
        return;
    }
    await compose.down({
        cwd: dockerComposeDir,
        composeOptions: [['-f', 'compose.postgres.yml']],
        log: true,
    });
};

let server: INestApplication;

export const startServer = async () => {
    if (
        env.START_DB_SERVER === 'true' ||
        env.START_DB_SERVER === 'TRUE' ||
        config.test?.startDbServer === true
    ) {
        await startDbServer();
    }

    server = await NestFactory.create(AppModule, {
        httpsOptions,
        logger: ['log'],
    });
    server.useGlobalPipes(
        new ValidationPipe({
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    );

    await server.listen(port);
    //const nPort = 4000;

    // Verwende den neuen Port beim Starten des Servers
    //await server.listen(nPort);
    return server;
};

export const shutdownServer = async () => {
    try {
        await server.close();
    } catch {
        console.warn('Der Server wurde fehlerhaft beendet.');
    }

    if (env.START_DB_SERVER === 'true' || env.START_DB_SERVER === 'TRUE') {
        await shutdownDbServer();
    }
};

export const httpsAgent = new Agent({
    requestCert: true,
    rejectUnauthorized: false,
    ca: httpsOptions.cert as Buffer,
});
