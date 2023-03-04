import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { AdminController } from 'src/admin/admin.controller';
import { AdminService } from 'src/admin/admin.service';
import { Faq } from 'src/admin/entities/faq.entity';
import { LocalAdminStrategy } from 'src/admin/strategies/local.admin.strategy';
import { JwtAdminStrategy } from 'src/admin/strategies/jwt.admin.strategy';
import { RefreshTokenAdminStrategy } from 'src/admin/strategies/refresh.token.admin.strategy';
import { User } from 'src/auth/entities/user.entity';
import { Collection } from 'src/collections/entities/collection.entity';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Faq, User, Collection, Photospot, Meetup]), JwtModule],
  providers: [AdminService, LocalAdminStrategy, JwtAdminStrategy, RefreshTokenAdminStrategy],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
