import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InjectUser } from 'src/auth/auth.decorator';
import { CollectionsService } from 'src/collections/collections.service';
import { JwtGuard } from 'src/auth/guard/jwt/jwt.guard';
import { Collection } from 'src/collections/entities/collection.entity';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';

@Controller('/api/collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  async getCollectionsList(@Query('keyword') keyword: string, @Query('p') p: number = 1): Promise<Collection[]> {
    return await this.collectionsService.getCollectionsList(keyword, p);
  }

  @Get(':collectionId')
  async getColletion(@Param('collectionId') collectionId: number): Promise<Collection> {
    return await this.collectionsService.getColletion(collectionId);
  }

  @Post()
  @UseGuards(JwtGuard)
  async createCollection(
    @Body() createCollectionDto: CreateCollectionDto,
    @InjectUser() userDTO: decodedAccessTokenDTO
  ): Promise<void> {
    createCollectionDto.userId = userDTO.id;
    return await this.collectionsService.createCollection(createCollectionDto);
  }
}
