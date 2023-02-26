import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async createSampleUser() {
    return await this.usersRepository.insert({
      email: 'test_email@gmail.com', 
      password: 'qwer1234',
    })
  }
}
