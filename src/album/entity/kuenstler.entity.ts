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
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { unique: true, length: 40 })
    readonly name!: string;

    @Column('varchar', { unique: true, length: 40 })
    readonly vorname!: string;

    @OneToOne(() => Album, (album) => album.kuenstler)
    @JoinColumn({ name: 'album_id' })
    album: Album | undefined;

    @Column('int')
    readonly alter: number | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            name: this.name,
            vorname: this.vorname,
            alter: this.alter,
        });
}
