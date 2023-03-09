import { Injectable, NotFoundException, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { Photospot } from '../photospot/entities/photospot.entity';
import { Collection } from '../collections/entities/collection.entity';
import { Photo } from './entities/photo.entity';
import { S3Service } from './../common/aws/s3.service';

@Injectable()
export class PhotospotService {
  constructor(
    @InjectRepository(Photospot) private photospotRepository: Repository<Photospot>,
    @InjectRepository(Collection) private collectionRepository: Repository<Collection>,
    @InjectRepository(Photo) private PhotoRepository: Repository<Photo>,
    private readonly s3Service: S3Service
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
    const { title, description, latitude, longitude }: CreatePhotospotDto = createPhtospotDto;
    const images = await Promise.all(files.map((file) => this.s3Service.putObject(file)));
    await this.photospotRepository.insert({
      title,
      description,
      latitude,
      longitude,
      userId,
      collectionId,
      photos: images.map((image) => ({
        userId,
        image,
      })),
    });
  }

  async getAllPhotospot(collectionId: number): Promise<Photospot[]> {
    const collection = await this.collectionRepository.findOne({ where: { id: collectionId } });

    if (_.isNil(collection)) {
      throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
    }

    const photospots = await this.photospotRepository.find({ where: { collectionId }, relations: {photos: true} });
    return photospots;
  }

  async getPhotospot(photospotId: number): Promise<Photospot> {
    const photospot = await this.photospotRepository.findOne({ where: { id: photospotId } });

    if (_.isNil(photospot)) {
      throw new NotFoundException('해당 포토스팟을 찾을 수 없습니다.');
    }

    return photospot;
  }

  async modifyPhotospot(modifyPhotospotDto: ModifyPhotospotDto, photospotId: number, userId: number): Promise<void> {
    const { title, description, image }: ModifyPhotospotDto = modifyPhotospotDto;
    let updateData;
    const photospot = await this.getPhotospot(photospotId);

    if (photospot.userId !== userId) {
      throw new NotAcceptableException('해당 포토스팟에 접근 할 수 없습니다');
    }

    if (_.isNil(image)) {
      updateData = { title, description };
    } else {
      const imagePath = await this.s3Service.putObject(image);
      updateData = { title, description };
    }

    this.photospotRepository.update({ id: photospotId }, updateData);
  }

  async deletePhotospot(photospotId: number, userId: number) {
    const photospot = await this.getPhotospot(photospotId);

    if (photospot.userId !== userId) {
      throw new NotAcceptableException('해당 포토스팟에 접근 할 수 없습니다');
    }

    this.photospotRepository.softDelete(photospotId);
  }
}
