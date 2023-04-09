import {
  BadRequestException,
  CACHE_MANAGER,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { MoreThanOrEqual, Repository, UpdateResult } from 'typeorm';
import bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import moment from 'moment';
import randomToken from 'rand-token';
import _ from 'lodash';
import { Admin } from 'src/admin/entities/admin.entity';
import { User } from 'src/auth/entities/user.entity';
import { Collection } from 'src/collections/entities/collection.entity';
import { Photospot } from 'src/photospot/entities/photospot.entity';
import { Meetup } from 'src/meetups/entities/meetup.entity';
import { Faq } from 'src/admin/entities/faq.entity';
import { AdminGetListQueryDto } from 'src/admin/dto/admin.get.list.dto';
import { SignupAdminResDto } from 'src/admin/dto/signup.admin.res.dto';
import { SigninAdminDto } from 'src/admin/dto/signin.admin.dto';
import { SignupAdminReqDto } from 'src/admin/dto/signup.admin.req.dto';
import { CreateAdminFaqDto } from 'src/admin/dto/create.admin.faq.dto';
import { UpdateAdminFaqDto } from 'src/admin/dto/update.admin.faq.dto';
import type { PaginatedList, JwtResult } from 'src/admin/admin.types';

@Injectable()
export class AdminService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(User) private adminUsersRepository: Repository<User>,
    @InjectRepository(Collection) private adminCollectionsRepository: Repository<Collection>,
    @InjectRepository(Photospot) private adminPhotospotsRepository: Repository<Photospot>,
    @InjectRepository(Meetup) private adminMeetupsRepository: Repository<Meetup>,
    @InjectRepository(Faq) private adminFaqRepository: Repository<Faq>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) { }

  // 관리자 관리
  async getAdminsList({ search, p }: AdminGetListQueryDto): Promise<PaginatedList<Admin>> {
    const adminList = this.adminRepository.createQueryBuilder('admin');
    if (search) {
      adminList.where('admin.account LIKE :search OR admin.responsibility LIKE :search', {
        search: `%${search}%`,
      });
    }

    const take = this.configService.get('PAGE_TAKE_ADMIN_ADMIN_LIST');
    const page: number = p > 0 ? p : 1;
    const total = await adminList.getCount();
    adminList
      .skip((page - 1) * take)
      .take(take)
      .orderBy('admin.id', 'DESC');

    return {
      data: await adminList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
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

  async signinAdmin(user: Admin): Promise<JwtResult> {
    const accessToken = await this.issueAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id);
    const jwtData = { accessToken, refreshToken };
    return { jwtData, message: '로그인에 성공하였습니다.' };
  }

  public async verifyAdmin(account: string, password: string): Promise<SigninAdminDto> {
    const admin = await this.adminRepository.findOne({ where: { account }, select: { id: true, account: true, password: true } });
    if (_.isNil(admin)) {
      throw new UnauthorizedException({ message: '아이디가 존재하지 않습니다.' });
    }
    await this.verifyPassword(password, admin.password);
    let signinAdminDto = new SigninAdminDto();
    signinAdminDto.id = admin.id;
    signinAdminDto.account = admin.account;
    return signinAdminDto;
  }

  private async verifyPassword(password: string, hashPassword: string): Promise<void> {
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
      return this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ADMIN_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ADMIN_ACCESS_TOKEN_EXPIRES_IN'),
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  public async issueRefreshToken(id: number): Promise<string> {
    try {
      const refreshTokenData = {
        refreshToken: randomToken.generate(30),
        refreshTokenExp: moment().day(7).toDate(),
      };
      await this.adminRepository.update(id, refreshTokenData);
      return refreshTokenData.refreshToken;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  public async reissueAdminAccessToken(refreshToken: string, user: Admin): Promise<JwtResult> {
    const accessToken = await this.issueAccessToken(user);
    const jwtData = { accessToken, refreshToken };
    return { jwtData, message: 'Access 토큰을 정상적으로 재발급하였습니다.' };
  }

  public async verifyRefreshToken(account: string, refreshToken: string): Promise<SigninAdminDto> {
    const currentDate = new Date();
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

  async deleteAdmin(id: number): Promise<void> {
    await this.adminRepository.delete(id);
  }

  public async signoutAdmin(id: number): Promise<void> {
    if (HttpStatus.OK !== 200) {
      throw new BadRequestException('유효하지 않은 상태 코드입니다.');
    }
    const admin = await this.adminRepository.findOne({ where: { id }, select: { id: true, refreshToken: true } });
    if (_.isNil(admin)) {
      throw new NotFoundException('해당 관리자 계정을 찾을 수 없습니다.');
    }
    await this.adminRepository.update(admin.id, { refreshToken: null });
  }

  // 유저 관리
  async getAdminUsersList({ search, p }: AdminGetListQueryDto): Promise<PaginatedList<User>> {
    const usersList = this.adminUsersRepository.createQueryBuilder('user');
    if (search) {
      usersList.where('user.email LIKE :search OR user.username LIKE :search ', { search: `%${search}%` });
    }

    const take = this.configService.get('PAGE_TAKE_ADMIN_USER_LIST');
    const page: number = p > 0 ? p : 1;
    const total = await usersList.getCount();
    usersList
      .skip((page - 1) * take)
      .take(take)
      .orderBy('user.id', 'DESC');

    return {
      data: await usersList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
  }

  async blockAdminUser(id: string, blockUser: Record<'isBlock', boolean>): Promise<void> {
    if (blockUser.isBlock) {
      this.cacheManager.set<boolean>(`user-${id}-block`, true, {
        ttl: 60 * 60,
      });
    } else {
      this.cacheManager.del(`user-${id}-block`);
    }
    await this.adminUsersRepository
      .createQueryBuilder()
      .update()
      .set({
        isBlock: blockUser.isBlock,
      })
      .where('id = :id', { id })
      .execute();
  }

  // 콜렉션 관리
  async getAdminCollectionsList({ search, p }: AdminGetListQueryDto): Promise<PaginatedList<Collection>> {
    const collectionsList = this.adminCollectionsRepository.createQueryBuilder('c');
    if (search) {
      collectionsList.where('c.title LIKE :search OR c.description LIKE :search', {
        search: `%${search}%`,
      });
    }
    collectionsList
      .select(['c.id', 'c.userId', 'c.title', 'c.description', 'c.createdAt', 'ck'])
      .leftJoin('c.user', 'user')
      .leftJoin('c.photospots', 'photospot')
      .leftJoin('c.collectionKeywords', 'ck')
      .orderBy('c.id', 'DESC');

    const take = this.configService.get('PAGE_TAKE_ADMIN_COLLECTION_LIST');
    const page: number = p > 0 ? p : 1;
    const total = await collectionsList.getCount();
    collectionsList.skip((page - 1) * take).take(take);
    return {
      data: await collectionsList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
  }

  async deleteAdminCollection(id: number): Promise<void> {
    await this.adminCollectionsRepository.findOne({ where: { id } });
    if (_.isNil(id)) {
      throw new NotFoundException('해당 콜렉션 게시물을 찾을 수 없습니다.');
    }
    await this.adminCollectionsRepository.softDelete(id);
  }

  // 포토스팟 관리
  getAdminPhotospotList(collectionId: number): Promise<Photospot[]> {
    return this.adminPhotospotsRepository.find({ where: { collectionId } });
  }

  async getAdminPhotospot(photospotId: number): Promise<Photospot> {
    const photospot = await this.adminPhotospotsRepository.findOne({ where: { id: photospotId } });
    if (_.isNil(photospot)) {
      throw new NotFoundException('해당 포토스팟 게시물을 찾을 수 없습니다.');
    }
    return photospot;
  }

  async deleteAdminPhotospot(photospotId: number): Promise<void> {
    await this.getAdminPhotospot(photospotId);
    if (_.isNil(photospotId)) {
      throw new NotFoundException('해당 포토스팟 게시물을 찾을 수 없습니다.');
    }
    await this.adminPhotospotsRepository.softDelete(photospotId);
  }

  // 모임 관리
  async getAdminMeetupsList({ search, p }: AdminGetListQueryDto): Promise<PaginatedList<Meetup>> {
    const meetupsList = this.adminMeetupsRepository
      .createQueryBuilder('m')
      .select([
        'm.id',
        'm.userId',
        'u.email',
        'u.username',
        'm.title',
        'm.content',
        'm.place',
        'm.schedule',
        'm.headcount',
        'm.createdAt',
        'j',
      ])
      .leftJoin('m.joins', 'j')
      .leftJoin('m.user', 'u')
      .orderBy('m.id', 'DESC');

    if (search) {
      meetupsList.where('m.title LIKE :search OR m.content LIKE :search OR m.place LIKE :search', {
        search: `%${search}%`,
      });
    }

    const take = this.configService.get('PAGE_TAKE_ADMIN_MEETUP_LIST');
    const page: number = p > 0 ? p : 1;
    const total = await meetupsList.getCount();
    meetupsList.skip((page - 1) * take).take(take);

    return {
      data: await meetupsList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
  }

  async deleteAdminMeetup(id: number): Promise<void> {
    await this.adminMeetupsRepository.findOne({ where: { id } });
    if (_.isNil(id)) {
      throw new NotFoundException('해당 모임 게시물을 찾을 수 없습니다.');
    }
    await this.adminMeetupsRepository.delete(id);
  }

  // 자주찾는질문 관리
  async getAdminFaqList({ search, p }: AdminGetListQueryDto): Promise<PaginatedList<Faq>> {
    const faqList = this.adminFaqRepository.createQueryBuilder('faq');
    if (search) {
      faqList.where('faq.title LIKE :search OR faq.content LIKE :search', {
        search: `%${search}%`,
      });
    }

    const take = this.configService.get('PAGE_TAKE_ADMIN_FAQ_LIST');
    const page: number = p > 0 ? p : 1;
    const total = await faqList.getCount();
    faqList
      .skip((page - 1) * take)
      .take(take)
      .orderBy('faq.id', 'DESC');

    return {
      data: await faqList.getMany(),
      total,
      page,
      lastPage: Math.ceil(total / take),
    };
  }

  async getAdminFaq(id: number): Promise<Faq> {
    const faq = await this.adminFaqRepository.findOne({ where: { id } });
    if (_.isNil(faq)) {
      throw new NotFoundException('해당 자주찾는질문 게시물을 찾을 수 없습니다.');
    }
    return faq;
  }

  async createAdminFaq(createAdminFaqDto: CreateAdminFaqDto): Promise<void> {
    await this.adminFaqRepository.save(createAdminFaqDto);
  }

  async updateAdminFaq(updateAdminFaqtDto: UpdateAdminFaqDto, id: number): Promise<void> {
    await this.getAdminFaq(id);
    await this.adminFaqRepository.update({ id }, updateAdminFaqtDto);
  }

  async deleteAdminFaq(id: number): Promise<void> {
    await this.getAdminFaq(id);
    await this.adminFaqRepository.softDelete(id);
  }
}