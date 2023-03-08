import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Join } from 'src/meetups/entities/join.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { JoinService } from './join.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meetup, Join]),
  ],
  providers: [JoinService],
  exports: [JoinService]
})
export class JoinModule {}
