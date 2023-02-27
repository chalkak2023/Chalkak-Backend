import { Controller, Post, Get, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data/dist/decorators/form-data';
import { CreatePhotospotDto } from './dto/create-photospot.dto';
import { PhotospotService } from './photospot.service';

@Controller('/collections/photospots')
export class PhotospotController {
  constructor(private readonly photospotService: PhotospotService) {}
  
  @Post()
  @FormDataRequest()
  createPhotospot(@Body() createPhtospotDto: CreatePhotospotDto): void {
    this.photospotService.createPhotospot(createPhtospotDto)
  }
}
