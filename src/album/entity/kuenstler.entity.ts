import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Album } from './album.entity.js';

@Entity()
export class Kuenstler {
    @Column('int')
    // https://typeorm.io/entities#primary-columns
    // CAVEAT: zuerst @Column() und erst dann @PrimaryGeneratedColumn()
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { unique: true, length: 40 })
    readonly kuenstler!: string;

    @OneToOne(() => Album, (album) => album.name)
    @JoinColumn({ name: 'album_id' })
    album: Album | undefined;

    readonly alter: number | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            kuenstler: this.kuenstler,
        });
}
