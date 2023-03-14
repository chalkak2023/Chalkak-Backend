import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import * as _ from 'lodash'

@Injectable()
export class FileVaildationPipe implements PipeTransform {
  constructor(private readonly mode: string){}
  transform(value: any, metadata: ArgumentMetadata) {
    const imageType = ['IMAGE/PNG', 'IMAGE/JPEG', 'IMAGE/JPG'];
    
    if (_.isEmpty(value)) {
      if (this.mode === 'create') {
        throw new BadRequestException('이미지 파일을 입력하셔야 합니다.');
      } else if (this.mode === 'modify'){
        return [];
      }
    }

    if (value.length > 5) {
      throw new BadRequestException('이미지 파일은 최대 5장만 가능합니다.');
    }

    value.forEach((val: any) => {
      if (!imageType.includes(val.mimetype.toUpperCase())) {
        throw new BadRequestException('이미지 파일만 업로드 할 수 있습니다.');
      }
    })

    return value;
  }
}