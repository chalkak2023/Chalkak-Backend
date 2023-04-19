import { ConfigService } from '@nestjs/config';
import { PhotoKeyword } from './entities/photokeyword.entity';
import { Inject, Injectable, NotFoundException, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Logger } from 'winston';
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
    @Inject('winston') private readonly logger: Logger,
    private readonly configService: ConfigService,
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
            .insert({ image, userId, photospotId: photospot.identifiers[0].id });
          this.createImageKeyword(image, photo.identifiers[0].id);
        } catch (error) {
          console.log(error);
          throw new Error('Photo 입력 실패.');
        }
      }
      await queryRunner.commitTransaction();
      this.isSafePhoto(photospot.identifiers[0].id);
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
    const photospot = await this.photospotRepository.findOne({ where: { id: photospotId }, relations: { photos: true } });

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
      this.isSafePhoto(photospotId);
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

    await Promise.all([
      this.photospotRepository.softRemove(photospot),
      this.photoRepository.delete({ photospotId: photospot.id }),
    ]);
  }

  async getRandomPhoto(): Promise<Photo[]> {
    const photos = await this.photoRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.photospot', 'photospot')
      .leftJoinAndSelect('photospot.collection', 'collection')
      .select(['p.id', 'p.image', 'photospot.id', 'collection.id'])
      .orderBy('RAND()')
      .limit(5)
      .getMany();
    if (_.isEmpty(photos)) {
      throw new NotFoundException(`등록된 포토스팟이 없습니다.`);
    }
    return photos;
  }

  async createImageKeyword(image: string, photoId: number): Promise<void> {
    try {
      const photoKeywords = await this.googleVisionService.imageLabeling(image);
      const keyword = [];
      for (const photoKeyword of photoKeywords) {
        if (_.isUndefined(photoKeyword)) {
          continue;
        }

        const preKeyword = await this.photoKeywordRepository.findOne({ where: { keyword: photoKeyword } });
        if (_.isNil(preKeyword)) {
          const insertKeyword = await this.photoKeywordRepository.save({ keyword: photoKeyword });
          keyword.push(insertKeyword);
        } else {
          keyword.push(preKeyword);
        }
      }
      const photo = await this.photoRepository.findOne({ where: { id: photoId } });
      if (_.isNil(photo)) {
        return;
      }
      photo.photoKeywords = keyword;
      await this.photoRepository.save(photo);
    } catch (err) {
      this.logger.error(`[createImageKeyword] [POST /api/collections/:collectionId/photospots] ${err}`);
    }
  }

  async getRecommendPhoto(id: number): Promise<Photo[]> {
    const userPhoto = await this.photoRepository.findOne({ where: { id }, relations: { photoKeywords: true } });
    const userPhotoKeywords = userPhoto?.photoKeywords.map((k) => k.id);
    return this.photoRepository
      .createQueryBuilder('photo')
      .leftJoinAndSelect('photo.photoKeywords', 'keywords')
      .leftJoinAndSelect('photo.photospot', 'photospot')
      .leftJoinAndSelect('photospot.collection', 'collection')
      .select(['photo.id', 'photo.image', 'photospot.id', 'collection.id'])
      .where('keywords.id IN (:...userPhotoKeywords)', { userPhotoKeywords })
      .andWhere('photo.id != :id', { id })
      .groupBy('photo.id')
      .orderBy('COUNT(photo.id)', 'DESC')
      .limit(5)
      .getMany();
  }

  async getAllPhoto(page: number) {
    const take = this.configService.get('PHOTOS_PAGE_LIMIT') || 18;
    return this.photoRepository
      .createQueryBuilder('photo')
      .leftJoinAndSelect('photo.photospot', 'photospot')
      .leftJoinAndSelect('photospot.collection', 'collection')
      .select(['photo.id', 'photo.image', 'photospot.id', 'collection.id'])
      .take(take)
      .skip((page - 1) * take)
      .getMany();
  }

  async isSafePhoto(photospotId: number): Promise<void> {
    try {
      const photospot = await this.getPhotospot(photospotId);
      const photoCount = photospot.photos.length;

      photospot.photos.forEach(async (photo) => {
        const isSafe = await this.googleVisionService.imageSafeGuard(photo.image);
        if (!isSafe) {
          if (photoCount === 1) {
            await Promise.all([this.photospotRepository.softRemove(photospot), this.photoRepository.delete(photo.id)]);
          } else {
            await this.photoRepository.delete(photo.id);
          }
        }
      });
    } catch (err) {
      this.logger.error(`[isSafePhoto] [POST /api/collections/:collectionId/photospots] ${err}`);
    }
  }
}
