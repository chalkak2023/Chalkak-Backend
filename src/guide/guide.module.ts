import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from 'src/admin/entities/faq.entity';
import { GuideController } from 'src/guide/guide.controller';
import { GuideService } from 'src/guide/guide.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  providers: [GuideService],
  controllers: [GuideController],
  exports: [GuideService],
})
export class GuideModule { }
