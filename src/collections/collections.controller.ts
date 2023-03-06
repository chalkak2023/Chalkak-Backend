import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectUser } from 'src/auth/auth.decorator';
import { CollectionsService } from 'src/collections/collections.service';
import { JwtGuard } from 'src/auth/guard/jwt/jwt.guard';
import { Collection } from 'src/collections/entities/collection.entity';
import { CollectionKeyword } from 'src/collections/entities/collection.keyword.entity';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { UpdateCollectionContentDto } from 'src/collections/dto/update.collection.content.dto';
import { UpdateCollectionKeywordDto } from 'src/collections/dto/update.collection.keyword.dto';
import { AddCollectionKeywordDto } from 'src/collections/dto/add.collection.keyword.dto';

@Controller('/api/collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  async getCollectionsList(@Query('keyword') keyword: string, @Query('p') p: number = 1): Promise<Collection[]> {
    return await this.collectionsService.getCollectionsList(keyword, p);
  }

  @Get(':collectionId')
  async getCollection(@Param('collectionId') collectionId: number): Promise<Collection> {
    return await this.collectionsService.getCollection(collectionId);
  }

  @Get(':collectionId/keywords/:keywordId')
  async getCollectionKeyword(@Param('keywordId') keywordId: number): Promise<CollectionKeyword> {
    return this.collectionsService.getCollectionKeyword(keywordId);
  }

  @Post()
  @UseGuards(JwtGuard)
  createCollection(@Body() createCollectionDto: CreateCollectionDto, @InjectUser() userDTO: decodedAccessTokenDTO) {
    createCollectionDto.userId = userDTO.id;
    return this.collectionsService.createCollection(createCollectionDto);
  }

  @Post(':collectionId/keywords')
  @UseGuards(JwtGuard)
  async addCollectionKeyword(
    @Body() addCollectionKeywordDto: AddCollectionKeywordDto,
    @Param('collectionId') collectionId: number,
    @InjectUser('id') userId: number
  ): Promise<void> {
    return await this.collectionsService.addCollectionKeyword(addCollectionKeywordDto, collectionId, userId);
  }

  @Put(':collectionId')
  @UseGuards(JwtGuard)
  async updateCollectionContent(
    @Body() updateCollectionContentDto: UpdateCollectionContentDto,
    @Param('collectionId') collectionId: number,
    @InjectUser('id') userId: number
  ) {
    await this.collectionsService.updateCollectionContent(updateCollectionContentDto, collectionId, userId);
  }

  @Put(':collectionId/keywords/:keywordId')
  @UseGuards(JwtGuard)
  async updateCollectionKeyword(
    @Body() updateCollectionKeywordDto: UpdateCollectionKeywordDto,
    @Param('collectionId') collectionId: number,
    @Param('keywordId') keywordId: number,
    @InjectUser('id') userId: number
  ) {
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
