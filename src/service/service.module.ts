import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from 'src/admin/entities/faq.entity';
import { ServiceController } from 'src/service/service.controller';
import { ServiceService } from 'src/service/service.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  providers: [ServiceService],
  controllers: [ServiceController],
  exports: [ServiceService],
})
export class ServiceModule {}
