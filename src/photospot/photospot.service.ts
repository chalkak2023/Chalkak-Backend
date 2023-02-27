import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { Photospot } from '../photospot/entities/photospot.entity';
import { S3Service } from './../common/aws/s3.service';

@Injectable()
export class PhotospotService {
  constructor(
    @InjectRepository(Photospot) private photospotRepository: Repository<Photospot>,
    private readonly s3Service: S3Service
  ) {}

  async createPhotospot({ title, description, latitude, longitude, image }: CreatePhotospotDto): Promise<void> {
    const imagePath = await this.s3Service.putObject(image);
    this.photospotRepository.insert({ title, description, latitude, longitude, imagePath, userId: 1, collectionId: 1 });
  }
}
