import vision from '@google-cloud/vision';
import * as _ from 'lodash';

export class GoogleVisionService {
  client = new vision.ImageAnnotatorClient({
    keyFilename: './visionApiKey.json',
  });

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
