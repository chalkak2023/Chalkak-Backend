import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { User } from 'src/auth/entities/user.entity';
import { Collection } from 'src/collections/entities/collection.entity';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(User) private adminUsersRepository: Repository<User>,
    @InjectRepository(Collection) private adminCollectionsRepository: Repository<Collection>,
    @InjectRepository(Photospot) private adminPhotospotsRepository: Repository<Photospot>,
    @InjectRepository(Meetup) private adminMeetupsRepository: Repository<Meetup>,
    private jwtService: JwtService
  ) {}

  // 관리자 관리
  async getAdminsList(alias: string) {
    return this.adminRepository.createQueryBuilder(alias);
  }

  private async hashPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  public async signupAdmin(data: SignupAdminReqDto): Promise<SignupAdminResDto> {
    let duplicateAdmin = await this.adminRepository.findOne({ where: { account: data.account }, select: { account: true } });
    if (duplicateAdmin) {
      throw new ConflictException({ message: '이미 중복되는 아이디가 있습니다.' });
    }

    let signupResult = new SignupAdminResDto();
    let newAdmin = new Admin();
    newAdmin.account = data.account;
    newAdmin.password = await this.hashPassword(data.password);
    newAdmin.responsibility = data.responsibility;

    await this.adminRepository.insert(newAdmin);
    signupResult.successStatus = true;
    signupResult.message = '새로운 관리자 계정을 정상적으로 생성하였습니다.';

    return signupResult;
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

  public async verifyRefreshToken(account: string, refreshToken: string): Promise<SigninAdminDto> {
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

  async deleteAdmin(id: number) {
    await this.isMasterAdmin(id);
    this.adminRepository.delete(id);
  }

  private async isMasterAdmin(id: number) {
    const admin = await this.adminRepository.findOne({ where: { id }, select: { account: true } });
    if (admin?.account === 'master') {
      throw new UnauthorizedException('마스터 관리자 계정은 삭제할 수 없습니다.');
    }
  }

  // 유저 관리
  async getAdminUsersList(keyword: string, p: number = 1): Promise<any> {
    const usersList = this.adminUsersRepository.createQueryBuilder('user');
    if (keyword) {
      usersList.where('user.email LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const take = 6;
    const page: number = (p as any) > 0 ? parseInt(p as any) : 1;
    const total = await usersList.getCount();
    usersList.skip((page - 1) * take).take(take);

    return {
      data: await usersList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
  }

  blockAdminUser(id: string, blockUser: any): Promise<any> {
    return this.adminUsersRepository
      .createQueryBuilder()
      .update()
      .set({
        isBlock: blockUser.isBlock,
      })
      .where('id = :id', { id })
      .execute();
  }

  // 콜렉션 관리
  async getAdminCollectionsList(keyword: string, p: number = 1): Promise<any> {
    const collectionsList = this.adminCollectionsRepository.createQueryBuilder('collection');
    if (keyword) {
      collectionsList.where('collection.title LIKE :keyword OR collection.description LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    const take = 6;
    const page: number = (p as any) > 0 ? parseInt(p as any) : 1;
    const total = await collectionsList.getCount();
    collectionsList.skip((page - 1) * take).take(take);

    return {
      data: await collectionsList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
  }

  async deleteAdminCollection(id: number) {
    try {
      await this.adminCollectionsRepository.findOne({ where: { id } });
      return this.adminCollectionsRepository.softDelete(id);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  // 포토스팟 관리
  async getAdminAllPhotospot(id: number): Promise<Photospot[]> {
    const photospots = await this.adminPhotospotsRepository.find({ where: { id } });
    if (!photospots.length) {
      throw new NotFoundException('해당 콜렉션을 찾을 수 없습니다.');
    }
    return photospots;
  }

  async getAdminPhotospot(photospotId: number): Promise<Photospot | null> {
    const photospot = await this.adminPhotospotsRepository.findOne({ where: { id: photospotId } });
    if (_.isNil(photospot)) {
      throw new NotFoundException('해당 포토스팟을 찾을 수 없습니다.');
    }
    return photospot;
  }

  async deleteAdminPhotospot(photospotId: number) {
    await this.getAdminPhotospot(photospotId);
    this.adminPhotospotsRepository.softDelete(photospotId);
  }

  // 모임 관리
  async getAdminMeetupsList(keyword: string, p: number = 1): Promise<any> {
    const meetupsList = this.adminMeetupsRepository.createQueryBuilder('meetup');
    if (keyword) {
      meetupsList.where('meetup.title LIKE :keyword OR meetup.content LIKE :keyword OR meetup.place LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    const take = 6;
    const page: number = (p as any) > 0 ? parseInt(p as any) : 1;
    const total = await meetupsList.getCount();
    meetupsList.skip((page - 1) * take).take(take);

    return {
      data: await meetupsList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
  }
}
