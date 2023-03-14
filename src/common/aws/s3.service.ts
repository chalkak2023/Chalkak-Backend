import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly region: string = this.configService.get<string>('AWS_BUCKET_REGION') || '';
  private readonly bucket: string = this.configService.get<string>('AWS_BUCKET_NAME') || '';

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async putObject(image: any) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: image.filename,
        Body: createReadStream(image.path),
        ContentType: image.mimetype,
      })
    );
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${image.filename}`;
  }
}
