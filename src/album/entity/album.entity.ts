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
    readonly genre: Genre | undefined;

    @OneToMany(() => Lied, (lied) => lied.album, {
        cascade: ['insert', 'remove'],
    })
    readonly lieder: Lied[] | undefined;

    @OneToOne(() => Kuenstler, (kuenstler) => kuenstler.album, {
        cascade: ['insert', 'remove'],
    })
    readonly kuenstler: Kuenstler | undefined;

    @Column('varchar', { length: 40 })
    readonly name: string | undefined;

    @Column('varchar', { length: 40 })
    readonly titelbild: string | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            genre: this.genre,
            lieder: this.lieder,
            kuenstler: this.kuenstler,
            name: this.name,
            titelbild: this.titelbild,
        });
}
