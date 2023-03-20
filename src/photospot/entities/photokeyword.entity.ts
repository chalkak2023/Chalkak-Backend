import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Photo } from './photo.entity';

@Entity({schema:'chalkak', name: 'photo_keyword'})
export class PhotoKeyword {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number

  @Column('int')
  photoId: number;

  @Column('varchar')
  keyword: string;

  @ManyToOne(() => Photo, (photo) => photo.photoKeywords)
  photo: Photo;
  
}