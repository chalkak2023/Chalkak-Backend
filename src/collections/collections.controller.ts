import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectUser } from 'src/auth/auth.decorator';
import { CollectionsService } from 'src/collections/collections.service';
import { JwtGuard } from 'src/auth/guard/jwt/jwt.guard';
import { Collection } from 'src/collections/entities/collection.entity';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { UpdateCollectionContentDto } from 'src/collections/dto/update.collection.content.dto';
import { UpdateCollectionKeywordDto } from 'src/collections/dto/update.collection.keyword.dto';

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

  @Put(':collectionId')
  @UseGuards(JwtGuard)
  async updateCollectionContent(
    @Body() updateCollectionContentDto: UpdateCollectionContentDto,
    @Param('collectionId') collectionId: number,
    @InjectUser('id') userId: number
  ): Promise<void> {
    await this.collectionsService.updateCollectionContent(updateCollectionContentDto, collectionId, userId);
  }

  @Put(':collectionId/keywords/:keywordId')
  @UseGuards(JwtGuard)
  async updateCollectionKeyword(
    @Body() updateCollectionKeywordDto: UpdateCollectionKeywordDto,
    @Param('collectionId') collectionId: number,
    @Param('keywordId') keywordId: number,
    @InjectUser('id') userId: number
  ): Promise<void> {
    await this.collectionsService.updateCollectionKeyword(updateCollectionKeywordDto, collectionId, keywordId, userId);
  }

  @Delete(':collectionId')
  @UseGuards(JwtGuard)
  async deleteCollection(@Param('collectionId') collectionId: number, @InjectUser('id') userId: number) {
    await this.collectionsService.deleteCollection(collectionId, userId);
  }

  @Delete(':collectionId/keywords/:keywordId')
  @UseGuards(JwtGuard)
  async deleteCollectionKeyword(
    @Param('collectionId') collectionId: number,
    @Param('keywordId') keywordId: number,
    @InjectUser('id') userId: number
  ) {
    await this.collectionsService.deleteCollectionKeyword(collectionId, keywordId, userId);
  }
}
