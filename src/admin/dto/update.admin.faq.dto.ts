import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminFaqDto } from 'src/admin/dto/create.admin.faq.dto';

export class UpdateAdminFaqDto extends PartialType(CreateAdminFaqDto) {}
