import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheConfigService } from './common/config/cache.config.service';
import { GuideModule } from './guide/guide.module';
import { ChatModule } from './chat/chat.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    JwtModule,
    CacheModule.registerAsync({ isGlobal: true, useClass: CacheConfigService }),
    EventEmitterModule.forRoot({
      global: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('CACHE_HOST') || 'localhost',
          port: configService.get<number>('CACHE_PORT') || 6379
        }
      })
    }),
    AuthModule,
    CollectionsModule,
    MeetupsModule,
    AdminModule,
    PhotospotModule,
    GuideModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
