import { Controller, Post, Get, Put, Delete, Body, Param, Query, UsePipes } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data/dist/decorators/form-data';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { ModifyPhotospotDto } from './dto/modify-photospot.dto';
import { PhotospotService } from './photospot.service';
import { Photospot } from './entities/photospot.entity';
import { PhotospotParam } from './types/photospotParam.interface';

@Controller('/api/collections')
export class PhotospotController {
  constructor(private readonly photospotService: PhotospotService) {}

  @Post('/:collectionId/photospots')
  @FormDataRequest()
  createPhotospot(
    @Body() createPhtospotDto: CreatePhotospotDto,
    @Param() { collectionId }: Pick<PhotospotParam, 'collectionId'>
  ): void {
    this.photospotService.createPhotospot(createPhtospotDto, 1, collectionId);
  }

  @Get('/:collectionId')
  async getAllPhotospot(@Param() { collectionId }: Pick<PhotospotParam, 'collectionId'>): Promise<Photospot[]> {
    return this.photospotService.getAllPhotospot(collectionId);
  }

  @Get('/:collectionId/photospots/:photospotId')
  async getPhotospot(@Param() param: PhotospotParam): Promise<Photospot | null> {
    return this.photospotService.getPhotospot(param);
  }

  @Put('/:collectionId/photospots/:photospotId')
  @FormDataRequest()
  async modifyPhotospot(@Body() modifyPhotospot: ModifyPhotospotDto, @Param() param: PhotospotParam): Promise<void> {
    await this.photospotService.modifyPhotospot(modifyPhotospot, param);
  }

  @Delete('/:collectionId/photospots/:photospotId')
  async deletePhotospot(@Param() param: PhotospotParam) {
    await this.photospotService.deletePhotospot(param);
  }
}
