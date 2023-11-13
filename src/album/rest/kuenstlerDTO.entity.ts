/* eslint-disable @typescript-eslint/no-magic-numbers */

import { IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KuenstlerDTO {
    @Matches('^\\w.*')
    @MaxLength(40)
    @ApiProperty({ example: 'Der Name', type: String })
    readonly titel!: string;

    @IsOptional()
    @MaxLength(40)
    @ApiProperty({ example: 'Der Vorname', type: String })
    readonly untertitel: string | undefined;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
