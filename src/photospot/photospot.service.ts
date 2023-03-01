import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { BadRequestException, HttpException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as _ from 'lodash';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { Photospot } from '../photospot/entities/photospot.entity';
import { S3Service } from './../common/aws/s3.service';

@Injectable()
export class PhotospotService {
  constructor(
    @InjectRepository(Photospot) private photospotRepository: Repository<Photospot>,
    private dataSource: DataSource,
    private readonly s3Service: S3Service
  ) {}

  async createPhotospot(createPhtospotDto: CreatePhotospotDto, userId: number, collectionId: number): Promise<void> {
    const { title, description, latitude, longitude, image }: CreatePhotospotDto = createPhtospotDto;

    const imagePath = await this.s3Service.putObject(image);
    this.photospotRepository.insert({ title, description, latitude, longitude, imagePath, userId, collectionId });
  }

  async getAllPhotospot(collectionId: number): Promise<Photospot[]> {
    const photospots = await this.photospotRepository.find({ where: { collectionId } });

    if (!photospots.length) {
      // throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
      throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
    }

    return photospots;
  }

  async getPhotospot({ collectionId, photospotId }: { collectionId: number; photospotId: number }): Promise<Photospot | null> {
    const photospot = await this.photospotRepository.findOne({ where: { collectionId, id: photospotId } });

    if (_.isNil(photospot)) {
      throw new NotFoundException('해당 포토스팟을 찾을 수 없습니다.');
    }

    return photospot;
  }

  async modifyPhotospot(
    modifyPhotospotDto: ModifyPhotospotDto,
    param: { collectionId: number; photospotId: number }
  ): Promise<void> {
      const { title, description, image }: ModifyPhotospotDto = modifyPhotospotDto;
      const { collectionId, photospotId }: { collectionId: number; photospotId: number } = param;
      let updateData;

      await this.getPhotospot({ collectionId, photospotId });

      if (_.isNil(image)) {
        updateData = { title, description };
      } else {
        const imagePath = await this.s3Service.putObject(image);
        updateData = { title, description, imagePath };
      }

      this.photospotRepository.update({ id: photospotId }, updateData);
   
  }
}
