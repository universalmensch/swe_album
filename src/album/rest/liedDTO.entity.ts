/* eslint-disable @typescript-eslint/no-magic-numbers */
import { IsInt, Matches, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LiedDTO {
    @Matches('^\\w*')
    @MaxLength(32)
    @ApiProperty({ example: 'Die Beschriftung', type: String })
    readonly name!: string;

    @IsInt()
    @Min(1)
    @ApiProperty({ example: 79, type: Number })
    readonly dauerInSekunden!: number;
}
/* eslint-enable @typescript-eslint/no-magic-numbers */
