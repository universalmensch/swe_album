import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Album } from './album.entity.js';

@Entity()
export class Lied {
    @Column('int')
    // https://typeorm.io/entities#primary-columns
    // CAVEAT: zuerst @Column() und erst dann @PrimaryGeneratedColumn()
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { unique: true, length: 32 })
    readonly beschriftung!: string;

    @Column('varchar', { length: 16 })
    readonly contentType: string | undefined;

    @ManyToOne(() => Album, (album) => album.lieder)
    @JoinColumn({ name: 'album_id' })
    album: Album | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            beschriftung: this.beschriftung,
            contentType: this.contentType,
        });
}
