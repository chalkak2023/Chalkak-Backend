import { Module } from '@nestjs/common';
import { PhotospotController } from './photospot.controller';
import { PhotospotService } from './photospot.service';

@Module({
  controllers: [PhotospotController],
  providers: [PhotospotService]
})
export class PhotospotModule {}
