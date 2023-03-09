import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import path from 'path';

export const multerOptionsFactory = (): MulterOptions => {
  return {
    storage: diskStorage({
      filename(req, file, cb) {
        const image = Buffer.from(file.originalname, 'latin1').toString('utf-8');
        const ext = path.extname(image);
        const basename = path.basename(image, ext);
        cb(null, `${basename}-${new Date().getTime()}${ext}`);
      },
    }),
  };
};
