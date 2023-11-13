/* eslint-disable @typescript-eslint/no-magic-numbers */

import { IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KuenstlerDTO {
    @Matches('^\\w.*')
    @MaxLength(40)
    @ApiProperty({ example: 'Der Name', type: String })
    readonly name!: string;

    @Matches('^\\w.*')
    @MaxLength(40)
    @ApiProperty({ example: 'Der Name', type: String })
    readonly vorname!: string;

    @IsOptional()
    @ApiProperty({ example: 27, type: Number })
    readonly alter: number | undefined;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
