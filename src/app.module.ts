import { CacheModule, Module } from '@nestjs/common';
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
import { QueueModule } from './queue/queue.module';
import { JoinModule } from './join/join.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env', 
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    JwtModule.register({
      secret: 'test',
      signOptions: {
        expiresIn: '1h',
      },
    }),
    CacheModule.register({ isGlobal: true }),
    AuthModule,
    CollectionsModule,
    MeetupsModule,
    AdminModule,
    PhotospotModule,
    QueueModule,
    JoinModule
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    }
  ],
})
export class AppModule {}
