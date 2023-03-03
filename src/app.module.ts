import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmConfigService } from './common/config/typeorm.config.service';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { MeetupsModule } from './meetups/meetups.module';
import { AdminModule } from './admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { PhotospotModule } from './photospot/photospot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    JwtModule.register({
      secret: 'test',
      signOptions: {
        expiresIn: '1h',
      },
    }),
    AuthModule,
    CollectionsModule,
    MeetupsModule,
    AdminModule,
    PhotospotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
