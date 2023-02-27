import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private usersRepository: Repository<User>) {}

  async createSampleUser() {
    let arr = [];
    for (let i = 1; i <= 5; i++) {
      const temp = {
        email: `test_emai_${i}@gmail.com`,
        password: 'qwer1234',
      };
      arr.push(temp);
    }
    return await this.usersRepository.insert(arr);
  }

  async signUp() {
    return {
      message: 'message',
    };
  }

  async signIn() {
    return {
      message: 'message',
    };
  }

  async signOut() {
    return {
      message: 'message',
    };
  }

  async postEmailVerification() {
    return {
      message: 'message',
    };
  }

  async putEmailVerification() {
    return {
      message: 'message',
    };
  }

  async changePassword() {
    return {
      message: 'message',
    };
  }

  async oauthSignIn() {
    return {
      message: 'message',
    };
  }
}
