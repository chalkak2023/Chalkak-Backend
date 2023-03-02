import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as _ from 'lodash';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { Photospot } from '../photospot/entities/photospot.entity';
import { S3Service } from './../common/aws/s3.service';

@Injectable()
export class PhotospotService {
  constructor(
    @InjectRepository(Photospot) private photospotRepository: Repository<Photospot>,
    private readonly s3Service: S3Service
  ) {}

  async createPhotospot(createPhtospotDto: CreatePhotospotDto, userId: number, collectionId: number): Promise<void> {
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
    const photospots = await this.photospotRepository.find({ where: { collectionId } });

    console.log(_.isEmpty(photospots))
    if (!photospots.length) {
      throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
    }

    return photospots;
  }

  async getPhotospot(photospotId: number): Promise<Photospot | null> {
    const photospot = await this.photospotRepository.findOne({ where: { id: photospotId } });

    if (_.isNil(photospot)) {
      throw new NotFoundException('해당 포토스팟을 찾을 수 없습니다.');
    }

    return photospot;
  }

  async modifyPhotospot(modifyPhotospotDto: ModifyPhotospotDto, photospotId: number): Promise<void> {
    const { title, description, image }: ModifyPhotospotDto = modifyPhotospotDto;
    let updateData;

    await this.getPhotospot(photospotId);

    if (_.isNil(image)) {
      updateData = { title, description };
    } else {
      const imagePath = await this.s3Service.putObject(image);
      updateData = { title, description, imagePath };
    }

    this.photospotRepository.update({ id: photospotId }, updateData);
  }

  async deletePhotospot(photospotId: number) {
    await this.getPhotospot(photospotId);

    this.photospotRepository.softDelete(photospotId);
  }
}
