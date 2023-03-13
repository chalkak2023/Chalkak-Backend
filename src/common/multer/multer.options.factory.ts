import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerOptionsFactory = (): MulterOptions => {
  return {
    storage: diskStorage({
      filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}-${new Date().getTime()}${ext}`);
      },
    }),
  };
};
