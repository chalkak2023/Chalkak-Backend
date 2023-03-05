import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminFaqDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
