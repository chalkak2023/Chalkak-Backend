import { PhotoKeyword } from './entities/photokeyword.entity';
import { Injectable, NotFoundException, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as _ from 'lodash';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { Photospot } from '../photospot/entities/photospot.entity';
import { Collection } from '../collections/entities/collection.entity';
import { Photo } from './entities/photo.entity';
import { S3Service } from './../common/aws/s3.service';
import { GoogleVisionService } from '../googleVision/GoogleVision.service';

@Injectable()
export class PhotospotService {
  constructor(
    @InjectRepository(Photospot) private photospotRepository: Repository<Photospot>,
    @InjectRepository(Collection) private collectionRepository: Repository<Collection>,
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @InjectRepository(PhotoKeyword) private photoKeywordRepository: Repository<PhotoKeyword>,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
    private readonly googleVisionService: GoogleVisionService
  ) {}

  async createPhotospot(
    createPhtospotDto: CreatePhotospotDto,
    files: Express.Multer.File[],
    userId: number,
    collectionId: number
  ): Promise<void> {
    const collection = await this.collectionRepository.findOne({ where: { id: collectionId } });

    if (_.isNil(collection)) {
      throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { title, description, latitude, longitude }: CreatePhotospotDto = createPhtospotDto;
      const photospot = await queryRunner.manager
        .getRepository(Photospot)
        .insert({ title, description, latitude, longitude, userId, collectionId });
      for (const file of files) {
        try {
          const image = await this.s3Service.putObject(file);
          const photo = await queryRunner.manager
            .getRepository(Photo)
            .save({ image, userId, photospotId: photospot.identifiers[0].id });
          this.createImageKeyword(image, photo);
        } catch (error) {
          console.log(error);
          throw new Error('Photo 입력 실패.');
        }
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('요청이 올바르지 않습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  async getAllPhotospot(collectionId: number): Promise<Photospot[]> {
    const collection = await this.collectionRepository.findOne({ where: { id: collectionId } });

    if (_.isNil(collection)) {
      throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
    }

    const photospots = await this.photospotRepository.find({ where: { collectionId }, relations: { photos: true } });

    return photospots;
  }

  async getPhotospot(photospotId: number): Promise<Photospot> {
    const photospot = await this.photospotRepository.findOne({ where: { id: photospotId } });

    if (_.isNil(photospot)) {
      throw new NotFoundException('해당 포토스팟을 찾을 수 없습니다.');
    }

    return photospot;
  }

  async modifyPhotospot(
    modifyPhotospotDto: ModifyPhotospotDto,
    files: Express.Multer.File[],
    photospotId: number,
    userId: number
  ): Promise<void> {
    const photospot = await this.getPhotospot(photospotId);

    if (photospot.userId !== userId) {
      throw new NotAcceptableException('해당 포토스팟에 접근 할 수 없습니다');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { title, description, deletePhotos }: ModifyPhotospotDto = modifyPhotospotDto;
      await queryRunner.manager.getRepository(Photospot).update({ id: photospotId }, { title, description });
      for (const file of files) {
        try {
          const image = await this.s3Service.putObject(file);
          const photo = await queryRunner.manager.getRepository(Photo).insert({ image, userId, photospotId });
          this.createImageKeyword(image, photo.identifiers[0].id);
        } catch {
          throw new Error('Photo 입력 실패.');
        }
      }
      if (!_.isNil(deletePhotos)) {
        for (const photo of deletePhotos) {
          await queryRunner.manager.getRepository(Photo).delete({ id: photo });
        }
      }
      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('요청이 올바르지 않습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  async deletePhotospot(photospotId: number, userId: number) {
    const photospot = await this.getPhotospot(photospotId);

    if (photospot.userId !== userId) {
      throw new NotAcceptableException('해당 포토스팟에 접근 할 수 없습니다');
    }

    this.photospotRepository.softDelete(photospotId);
  }

  async getRandomPhoto(): Promise<Photo[]> {
    const photos = await this.photoRepository
      .createQueryBuilder('p')
      .select(['p.id', 'p.image'])
      .orderBy('RAND()')
      .limit(5)
      .getMany();
    if (_.isEmpty(photos)) {
      throw new NotFoundException(`등록된 포토스팟이 없습니다.`);
    }
    return photos;
  }

  async createImageKeyword(image: string, photo: Photo): Promise<void> {
    const photoKeywords = await this.googleVisionService.image(image);
    for (const photoKeyword of photoKeywords) {
      if (_.isUndefined(photoKeyword)) {
        continue;
      }
      const preKeyword = await this.photoKeywordRepository.findOne({where: {keyword: photoKeyword}})
      if (_.isNil(preKeyword)) {
        const insertKeyword = await this.photoKeywordRepository.save({keyword: photoKeyword});
        await this.dataSource.query(`INSERT INTO photo_photo_keywords_photo_keyword VALUES (${photo.id}, ${insertKeyword.id})`);
      } else {
        await this.dataSource.query(`INSERT INTO photo_photo_keywords_photo_keyword VALUES (${photo.id}, ${preKeyword.id})`);
      }
    }
  }
}
