import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SignupAdminReqDto } from 'src/admin/dto/signup.admin.req.dto';
import { SignupAdminResDto } from 'src/admin/dto/signup.admin.res.dto';
import * as bcrypt from 'bcrypt';
import _ from 'lodash';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(@InjectRepository(Admin) private adminRepository: Repository<Admin>) {}

  async getAdminsList(alias: string) {
    return this.adminRepository.createQueryBuilder(alias);
  }

  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  // TODO : 유효성 검사 추가
  public async signupAdmin(data: SignupAdminReqDto): Promise<SignupAdminResDto> {
    try {
      let signupResult = new SignupAdminResDto();

      let newAdmin = new Admin();
      newAdmin.account = data.account;
      newAdmin.password = await this.hashPassword(data.password);
      newAdmin.responsibility = data.responsibility;

      await this.adminRepository.insert(newAdmin);
      signupResult.successStatus = true;
      signupResult.message = '새로운 관리자 계정을 정상적으로 생성하였습니다.';
      return signupResult;
    } catch (error) {
      throw new BadRequestException({
        message: '관리자 계정 생성에 실패했습니다.'
      })
    }
  }
}