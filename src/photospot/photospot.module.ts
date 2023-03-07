import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { PhotospotController } from './photospot.controller';
import { PhotospotService } from './photospot.service';
import { Photospot } from '../photospot/entities/photospot.entity';
import { Collection } from '../collections/entities/collection.entity';
import { S3Service } from './../common/aws/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Photospot, Collection]),
    NestjsFormDataModule.config({
      storage: FileSystemStoredFile,
      autoDeleteFile: false,
    }),
  ],
  controllers: [PhotospotController],
  providers: [PhotospotService, S3Service],
})
export class PhotospotModule {}
