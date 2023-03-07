import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { Injectable, NotFoundException, BadRequestException, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { Photospot } from '../photospot/entities/photospot.entity';
import { Collection } from '../collections/entities/collection.entity';
import { S3Service } from './../common/aws/s3.service';

@Injectable()
export class PhotospotService {
  constructor(
    @InjectRepository(Photospot) private photospotRepository: Repository<Photospot>,
    @InjectRepository(Collection) private collectionRepository: Repository<Collection>,
    private readonly s3Service: S3Service
  ) {}

  async createPhotospot(createPhtospotDto: CreatePhotospotDto, userId: number, collectionId: number): Promise<void> {
    const collections = await this.collectionRepository.find({ where: { id: collectionId } });

    if (_.isEmpty(collections)) {
      throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
    }

    try {
      const { title, description, latitude, longitude, image }: CreatePhotospotDto = createPhtospotDto;

      const imagePath = await this.s3Service.putObject(image);
      await this.photospotRepository.insert({ title, description, latitude, longitude, imagePath, userId, collectionId });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('요청이 올바르지 않습니다.');
    }
  }

  async getAllPhotospot(collectionId: number): Promise<Photospot[]> {
    const collections = await this.collectionRepository.find({ where: { id: collectionId } });

    if (_.isEmpty(collections)) {
      throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
    }

    const photospots = await this.photospotRepository.find({ where: { collectionId } });
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
      updateData = { title, description, imagePath };
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
