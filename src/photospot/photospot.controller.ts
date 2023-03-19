import { Controller, Post, Get, Put, Delete, Body, Param, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { PhotospotService } from './photospot.service';
import { Photospot } from './entities/photospot.entity';
import { InjectUser, UserGuard } from '../auth/auth.decorator';
import { FileVaildationPipe } from './pipes/FileValidation.pipe';
import { Photo } from './entities/photo.entity';

@Controller('/api')
export class PhotospotController {
  constructor(private readonly photospotService: PhotospotService) {}

  @Post('/collections/:collectionId/photospots')
  @UserGuard
  @UseInterceptors(FilesInterceptor('files'))
  async createPhotospot(
    @UploadedFiles(new FileVaildationPipe('create')) files: Express.Multer.File[],
    @Body() createPhtospotDto: CreatePhotospotDto,
    @Param('collectionId') collectionId: number,
    @InjectUser('id') userId: number
  ): Promise<void> {
    await this.photospotService.createPhotospot(createPhtospotDto, files, userId, collectionId);
  }

  @Get('/collections/:collectionId/photospots')
  async getAllPhotospot(@Param('collectionId') collectionId: number): Promise<Photospot[]> {
    return this.photospotService.getAllPhotospot(collectionId);
  }

  @Get('/collections/:collectionId/photospots/:photospotId')
  async getPhotospot(@Param('photospotId') photospotId: number): Promise<Photospot> {
    return this.photospotService.getPhotospot(photospotId);
  }


  @Put('/collections/:collectionId/photospots/:photospotId')
  @UserGuard
  @UseInterceptors(FilesInterceptor('files'))
  async modifyPhotospot(
    @UploadedFiles(new FileVaildationPipe('modify')) files: Express.Multer.File[],
    @Body() modifyPhotospot: ModifyPhotospotDto,
    @Param('photospotId') photospotId: number,
    @InjectUser('id') userId: number
  ): Promise<void> {    
    await this.photospotService.modifyPhotospot(modifyPhotospot, files, photospotId, userId);
  }

  @Delete('/collections/:collectionId/photospots/:photospotId')
  @UserGuard
  async deletePhotospot(@Param('photospotId') photospotId: number, @InjectUser('id') userId: number) {
    await this.photospotService.deletePhotospot(photospotId, userId);
  }
  
  @Get('/photospots/random')
  async getRandomPhoto(): Promise<Photo[]> {
    return await this.photospotService.getRandomPhoto();
  }
}
