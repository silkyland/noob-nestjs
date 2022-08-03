import { PrismaService } from './../prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { compareSync, hashSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { I18nRequestScopeService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: PrismaService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nRequestScopeService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: {
        email,
      },
    });
    if (user && compareSync(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<string> {
    try {
      const foundUser = await this.db.user.findUnique({
        where: { email: user.email },
      });

      if (!foundUser) {
        throw new HttpException(
          this.i18n.translate('auth.login.error'),
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!compareSync(user.password, foundUser.password)) {
        throw new HttpException(
          this.i18n.translate('auth.login.error'),
          HttpStatus.UNAUTHORIZED,
        );
      }
      const payload = { email: user.email, sub: user.id };
      return this.jwtService.sign(payload);
    } catch (error) {
      throw error;
    }
  }

  async register(user: User): Promise<string> {
    try {
      const newUser = await this.db.user.create({
        data: {
          ...user,
          password: hashSync(user.password, 10),
        },
      });

      return await this.jwtService.sign({
        email: newUser.email,
        sub: newUser.id,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            this.i18n.t(`auth.email_exists`),
            HttpStatus.FORBIDDEN,
          );
        }
      }
      throw e;
    }
  }
}
