import vision, { ImageAnnotatorClient } from '@google-cloud/vision';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';

@Injectable()
export class GoogleVisionService {
  client: ImageAnnotatorClient;

  constructor(private configSerivce: ConfigService) {
    const googlePrivateKey = this.configSerivce.get('GOOGLE_VISION_API_SECRET_KEY');
    const clientEmail = this.configSerivce.get('GOOGLE_VISION_API_CLIENT_EMAIL');
    this.client = new vision.ImageAnnotatorClient({
      credentials: {
        private_key: googlePrivateKey,
        client_email: clientEmail,
      },
    });
  }

  async imageLabeling(image: string) {
    return this.client
      .labelDetection(image)
      .then((results) => {
        const labels = results[0].labelAnnotations;
        if (_.isNil(labels)) return [];

        const result = labels.map((label) => {
          if (_.isString(label.description)) {
            return label.description;
          }
        });

        return [...new Set(result)];
      })
      .catch((err) => {
        console.log('error: ', err);
        return [];
      });
  }

  async imageSafeGuard(image: string) {
    const [result] = await this.client.safeSearchDetection(image);
    const detections = result.safeSearchAnnotation;
    const adult = detections?.adult;
    const violence = detections?.violence;
    const racy = detections?.racy;
    
    if (adult === 'LIKELY' || adult === 'VERY_LIKELY') {
      return false;
    } else if (violence === 'LIKELY' || violence === 'VERY_LIKELY') {
      return false;
    } else if (racy === 'LIKELY' || racy === 'VERY_LIKELY') {
      return false;
    } else {
      return true;
    }
  }
}
