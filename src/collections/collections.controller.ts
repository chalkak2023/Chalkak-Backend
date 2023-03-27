import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { InjectUser, Token } from 'src/auth/auth.decorator';
import { CollectionsService } from 'src/collections/collections.service';
import { JwtGuard } from 'src/auth/guard/jwt/jwt.guard';
import { Collection } from 'src/collections/entities/collection.entity';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { UpdateCollectionDto } from 'src/collections/dto/update.collection.dto';
import { GetCollectionIdDto } from 'src/collections/dto/get.collection.id.dto';
import { GetCollectionsListQueryDto } from 'src/collections/dto/get.collections.list.query.dto';
import { JwtService } from '@nestjs/jwt';
import { CollectionLike } from 'src/collections/entities/collection.like.entity';
import { CollectionList } from 'src/collections/collection.types';

@Controller('/api/collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly jwtService: JwtService,
  ) { }

  // 콜렉션
  @Get()
  async getCollectionsList(@Query() getCollectionsListQueryDto: GetCollectionsListQueryDto, @Token('accessToken') accessToken?: string): Promise<CollectionList[]> {
    const user = accessToken ? this.jwtService.decode(accessToken) : null
    return await this.collectionsService.getCollectionsList(getCollectionsListQueryDto, user);
  }

  @Get('top')
  async getTopCollectionsListForMain(@Token('accessToken') accessToken?: string): Promise<CollectionList[]> {
    const user = accessToken ? this.jwtService.decode(accessToken) : null
    return await this.collectionsService.getTopCollectionsListForMain(user);
  }

  @Get(':collectionId')
  async getCollection(@Param() { collectionId }: GetCollectionIdDto): Promise<Collection> {
    return await this.collectionsService.getCollection(collectionId);
  }

  @Post()
  @UseGuards(JwtGuard)
  createCollection(@Body() createCollectionDto: CreateCollectionDto, @InjectUser() userDTO: decodedAccessTokenDTO): Promise<Collection> {
    createCollectionDto.userId = userDTO.id;
    return this.collectionsService.createCollection(createCollectionDto);
  }

  @Put(':collectionId')
  @UseGuards(JwtGuard)
  async updateCollection(
    @Body() updateCollectionDto: UpdateCollectionDto,
    @Param('collectionId') collectionId: number,
    @InjectUser('id') userId: number
  ): Promise<void> {
    await this.collectionsService.updateCollection(updateCollectionDto, collectionId, userId);
  }

  @Delete(':collectionId')
  @UseGuards(JwtGuard)
  async deleteCollection(@Param('collectionId') collectionId: number, @InjectUser('id') userId: number): Promise<void> {
    await this.collectionsService.deleteCollection(collectionId, userId);
  }

  // 콜렉션 좋아요
  @Post(':collectionId/like')
  @UseGuards(JwtGuard)
  async addCollectionLike(@Param('collectionId') collectionId: number, @InjectUser('id') userId: number): Promise<CollectionLike> {
    return await this.collectionsService.addCollectionLike(userId, collectionId);
  }

  @Delete(':collectionId/like')
  @UseGuards(JwtGuard)
  async removeCollectionLike(@Param('collectionId') collectionId: number, @InjectUser('id') userId: number): Promise<void> {
    await this.collectionsService.removeCollectionLike(userId, collectionId);
  }
}
