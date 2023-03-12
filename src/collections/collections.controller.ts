import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectUser } from 'src/auth/auth.decorator';
import { CollectionsService } from 'src/collections/collections.service';
import { JwtGuard } from 'src/auth/guard/jwt/jwt.guard';
import { Collection } from 'src/collections/entities/collection.entity';
import { CreateCollectionDto } from 'src/collections/dto/create.collection.dto';
import { decodedAccessTokenDTO } from 'src/auth/dto/auth.dto';
import { UpdateCollectionDto } from 'src/collections/dto/update.collection.dto';
import { GetCollectionIdDto } from 'src/collections/dto/get.collection.id.dto';
import { GetCollectionsListDto } from 'src/collections/dto/get.collections.list.dto';

@Controller('/api/collections')
export class CollectionsController {
  constructor(private collectionsService: CollectionsService) {}

  @Get()
  async getCollectionsList(@Query() getCollectionsListDto: GetCollectionsListDto) {
    return await this.collectionsService.getCollectionsList(getCollectionsListDto);
  }

  @Get(':collectionId')
  async getCollection(@Param() { collectionId }: GetCollectionIdDto): Promise<Collection> {
    return await this.collectionsService.getCollection(collectionId);
  }

  @Post()
  @UseGuards(JwtGuard)
  createCollection(@Body() createCollectionDto: CreateCollectionDto, @InjectUser() userDTO: decodedAccessTokenDTO) {
    createCollectionDto.userId = userDTO.id;
    return this.collectionsService.createCollection(createCollectionDto);
  }

  @Put(':collectionId')
  @UseGuards(JwtGuard)
  async updateCollection(
    @Body() updateCollectionDto: UpdateCollectionDto,
    @Param('collectionId') collectionId: number,
    @InjectUser('id') userId: number
  ) {
    return await this.collectionsService.updateCollection(updateCollectionDto, collectionId, userId);
  }

  @Delete(':collectionId')
  @UseGuards(JwtGuard)
  async deleteCollection(@Param('collectionId') collectionId: number, @InjectUser('id') userId: number) {
    await this.collectionsService.deleteCollection(collectionId, userId);
  }
}
