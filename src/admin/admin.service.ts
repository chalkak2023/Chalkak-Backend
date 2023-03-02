import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { MoreThanOrEqual, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import moment from 'moment';
import randomToken from 'rand-token';
import _ from 'lodash';
import { Admin } from 'src/admin/entities/admin.entity';
import { SigninAdminDto } from 'src/admin/dto/signin.admin.dto';
import { SignupAdminResDto } from 'src/admin/dto/signup.admin.res.dto';
import { SignupAdminReqDto } from 'src/admin/dto/signup.admin.req.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService
  ) {}

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
        message: '관리자 계정 생성에 실패했습니다.',
      });
    }
  }

  public async signinAdmin(account: string, hashpassword: string): Promise<SigninAdminDto> {
    let admin = await this.adminRepository.findOne({ where: { account }, select: { id: true, account: true, password: true } });
    if (_.isNil(admin)) {
      throw new NotFoundException({ message: '아이디가 존재하지 않습니다.' });
    }
    await this.verifyPassword(hashpassword, admin.password);
    let signinAdminDto = new SigninAdminDto();
    signinAdminDto.id = admin.id;
    signinAdminDto.account = admin.account;

    return signinAdminDto;
  }

  private async verifyPassword(password: string, hashPassword: string) {
    const isValidPassword = await bcrypt.compare(password, hashPassword);
    if (!isValidPassword) {
      throw new UnauthorizedException({
        message: '잘못된 비밀번호입니다.',
      });
    }
  }

  public async issueAccessToken(signinAdminDto: SigninAdminDto): Promise<string> {
    try {
      const payload = { ...signinAdminDto };
      return this.jwtService.signAsync(payload, { secret: 'temporary', expiresIn: '1h' });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  public async issueRefreshToken(id: number): Promise<string> {
    try {
      const refreshTokenData = {
        refreshToken: randomToken.generate(30),
        refreshTokenExp: moment().day(7).format('YYYY/MM/DD'),
      };
      await this.adminRepository.update(id, refreshTokenData);
      return refreshTokenData.refreshToken;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  public async verifyfreshToken(account: string, refreshToken: string): Promise<SigninAdminDto> {
    const currentDate = moment().day(7).format('YYYY/MM/DD');
    let admin = await this.adminRepository.findOne({
      where: { account, refreshToken, refreshTokenExp: MoreThanOrEqual(currentDate) },
    });
    if (!admin) {
      throw new UnauthorizedException({
        message: '유효하지 않은 정보입니다.',
      });
    }
    let signinAdminDto = new SigninAdminDto();
    signinAdminDto.id = admin.id;
    signinAdminDto.account = admin.account;
    return signinAdminDto;
  }
}
