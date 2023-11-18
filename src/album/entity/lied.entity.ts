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
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { unique: true, length: 32 })
    readonly name!: string | undefined;

    @Column('varchar', { length: 16 })
    readonly dauerInSekunden: number | undefined;

    @ManyToOne(() => Album, (album) => album.lieder)
    @JoinColumn({ name: 'album_id' })
    album: Album | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            name: this.name,
            dauerInSekunden: String(this.dauerInSekunden),
        });
}
