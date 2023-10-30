import { Album } from '../../album/entity/album.entity.js';
import { AuthModule } from '../../security/auth/auth.module.js';
import { DbPopulateService } from './db-populate.service.js';
import { DevController } from './dev.controller.js';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Album]), AuthModule],
    controllers: [DevController],
    providers: [DbPopulateService],
    exports: [DbPopulateService],
})
export class DevModule {}
