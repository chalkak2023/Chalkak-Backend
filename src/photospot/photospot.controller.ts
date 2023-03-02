import { Controller, Post, Get, Put, Delete, Body, Param, Query, UsePipes } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data/dist/decorators/form-data';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { PhotospotService } from './photospot.service';
import { Photospot } from './entities/photospot.entity';

@Controller('/api/collections')
export class PhotospotController {
  constructor(private readonly photospotService: PhotospotService) {}

  @Post('/:collectionId/photospots')
  @FormDataRequest()
  createPhotospot(@Body() createPhtospotDto: CreatePhotospotDto, @Param('collectionId') collectionId: number): void {
    this.photospotService.createPhotospot(createPhtospotDto, 1, collectionId);
  }

  @Get('/:collectionId')
  async getAllPhotospot(@Param('collectionId') collectionId: number): Promise<Photospot[]> {
    return this.photospotService.getAllPhotospot(collectionId);
  }

  @Get('/:collectionId/photospots/:photospotId')
  async getPhotospot(@Param('photospotId') photospotId: number): Promise<Photospot | null> {
    return this.photospotService.getPhotospot(photospotId);
  }

  @Put('/:collectionId/photospots/:photospotId')
  @FormDataRequest()
  async modifyPhotospot(@Body() modifyPhotospot: ModifyPhotospotDto, @Param('photospotId') photospotId: number): Promise<void> {
    await this.photospotService.modifyPhotospot(modifyPhotospot, photospotId);
  }

  @Delete('/:collectionId/photospots/:photospotId')
  async deletePhotospot(@Param('photospotId') photospotId: number) {
    await this.photospotService.deletePhotospot(photospotId);
  }
}
