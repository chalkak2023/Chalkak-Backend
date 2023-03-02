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

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Faq]),
    JwtModule.register({
      secret: 'temporary',
      signOptions: {
        expiresIn: 30,
      },
    }),
    PassportModule,
  ],
  providers: [AdminService, LocalAdminStrategy, JwtAdminStrategy, RefreshTokenAdminStrategy],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
