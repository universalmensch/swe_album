import {
    Column,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Kuenstler } from './kuenstler.entity';
import { Lied } from './lied.entity';

export type Genre = 'POP' | 'RAP' | 'ROCK';

@Entity()
export class Album {
    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { length: 12 })
    @ApiProperty({ example: 'DRUCKAUSGABE', type: String })
    readonly art: Genre | undefined;

    @OneToOne(() => Kuenstler, (kuenstler) => kuenstler.album, {
        cascade: ['insert', 'remove'],
    })
    @OneToMany(() => Lied, (lied) => lied.album, {
        cascade: ['insert', 'remove'],
    })
    readonly lieder: Lied[] | undefined;

    readonly kuenstler: Kuenstler | undefined;

    readonly name: string | undefined;
}
