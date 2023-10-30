import {
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
//import { AlbumGetController } from './album/rest/album-get.controller.js';
import { AlbumModule } from './album/album.module.js';
import { type ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './security/auth/auth.module.js';
//import { BuchWriteController } from './buch/rest/buch-write.controller.js';
import { DevModule } from './config/dev/dev.module.js';
import { GraphQLModule } from '@nestjs/graphql';
import { HealthModule } from './health/health.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { RequestLoggerMiddleware } from './logger/request-logger.middleware.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { graphQlModuleOptions } from './config/graphql.js';
import { typeOrmModuleOptions } from './config/db.js';

@Module({
    imports: [
        AuthModule,
        AlbumModule,
        DevModule,
        GraphQLModule.forRoot<ApolloDriverConfig>(graphQlModuleOptions),
        LoggerModule,
        HealthModule,
        TypeOrmModule.forRoot(typeOrmModuleOptions),
    ],
})

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(RequestLoggerMiddleware)
            .forRoutes(
                //AlbumGetController,
                //BuchWriteController,
                'auth',
                'graphql',
            );
    }
}
