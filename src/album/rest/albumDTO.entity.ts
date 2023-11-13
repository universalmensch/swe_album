/* eslint-disable max-classes-per-file */
import { IsArray, IsOptional, Matches, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { type Genre } from '../entity/album.entity.js';
import { KuenstlerDTO } from './kuenstlerDTO.entity.js';
import { LiedDTO } from './liedDTO.entity.js';
import { Type } from 'class-transformer';

export class AlbumDtoOhneRef {
    @Matches(/^POP$|^RAP$|^ROCK$/u)
    @IsOptional()
    @ApiProperty({ example: 'POP', type: String })
    readonly genre: Genre | undefined;

    @IsOptional()
    @ApiProperty({ example: 'name', type: String })
    readonly name!: string;

    @IsOptional()
    @ApiProperty({ example: 'Beispiel.png', type: String })
    readonly titelbild!: string;
}

export class AlbumDTO extends AlbumDtoOhneRef {
    @ValidateNested()
    @Type(() => KuenstlerDTO)
    @ApiProperty({ type: KuenstlerDTO })
    readonly kuenstler!: KuenstlerDTO; //NOSONAR

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LiedDTO)
    @ApiProperty({ type: [LiedDTO] })
    readonly lieder: LiedDTO[] | undefined;
}
/* eslint-enable max-classes-per-file*/
