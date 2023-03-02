import { FileSystemStoredFile } from 'nestjs-form-data/dist/classes/storage';
import { IsFile, HasMimeType } from 'nestjs-form-data/dist/decorators';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
export class ModifyPhotospotDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsFile()
  @HasMimeType(['image/jpeg', 'image/png'])
  image?: FileSystemStoredFile;
}
