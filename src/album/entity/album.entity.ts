import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Kuenstler } from './kuenstler.entity.js';
import { Lied } from './lied.entity.js';
import { dbType } from '../../config/dbtype.js';

export type Genre = 'POP' | 'RAP' | 'ROCK';

@Entity()
export class Album {
    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar', { length: 12 })
    @ApiProperty({ example: 'POP', type: String })
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
    readonly name!: string;

    @Column('varchar', { length: 40 })
    readonly titelbild!: string;

    @CreateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    @UpdateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly aktualisiert: Date | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            genre: this.genre,
            name: this.name,
            titelbild: this.titelbild,
        });
}
