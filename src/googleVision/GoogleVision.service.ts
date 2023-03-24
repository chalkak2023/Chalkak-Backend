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
        if (_.isNil(labels)) return []

        const result = labels.map((label) => {
          if (_.isString(label.description)) {
            return label.description
          }
        });

        return [...new Set(result)];
      })
      .catch((err) => {
        console.log('error: ', err);
        return [];
      });
  }
}
