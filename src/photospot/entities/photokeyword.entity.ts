import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Photo } from './photo.entity';

@Entity({schema:'chalkak', name: 'photo_keyword'})
export class PhotoKeyword {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number

  @Column('varchar')
  keyword: string;

  @ManyToMany(() => Photo, (photo) => photo.photoKeywords)
  photos: Photo[];

}