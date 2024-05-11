import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';

@Injectable()
export class AuthService {
  //инициализируем призму чтобы к ней обращаться
  constructor(private prisma: PrismaService, private jwt: JwtService) { }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.issueTokens(user.id);

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);

    //401 error
    if (!result) throw new UnauthorizedException('Неверный токен');

    const user = await this.prisma.user.findUnique({
      where: {
        id: result.id,
      }
    });

    const tokens = await this.issueTokens(user.id);

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  // регистрация
  async register(dto: AuthDto) {
    //проверка на предыдущего юзера
    const oldUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })

    if (oldUser) throw new BadRequestException('Пользователь с таким email уже существует')

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: faker.person.firstName(),
        avatarPath: faker.image.avatar(),
        phone: faker.string.numeric('+7 (###) ###-##-##'),
        password: await hash(dto.password),
      }
    });

    const tokens = await this.issueTokens(user.id);

    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }

  //создание токена
  private async issueTokens(userId: number) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '15m'
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    })

    return { accessToken, refreshToken };
  }

  // возврат одинаковых полей дял регистрации и логина
  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
    }
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })

    //404 error
    if (!user) throw new NotFoundException('Пользователь не найден')

    const isValid = await verify(user.password, dto.password);

    if (!isValid) throw new UnauthorizedException('Неверный пароль');

    return user;
  }
}
