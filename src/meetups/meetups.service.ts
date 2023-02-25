import { Injectable } from '@nestjs/common';

@Injectable()
export class MeetupsService {
  constructor() {}

  getMeetups(): string {
    return 'hi';
  }
}
