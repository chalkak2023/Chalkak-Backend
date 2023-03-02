import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';
import { IsFile, HasMimeType } from 'nestjs-form-data/dist/decorators';

export class CreatePhotospotDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumberString()
  latitude: number;

  @IsNotEmpty()
  @IsNumberString()
  longitude: number;

  @IsNotEmpty()
  @IsFile()
  @HasMimeType(['image/jpeg', 'image/png'])
  image: FileSystemStoredFile;
}
