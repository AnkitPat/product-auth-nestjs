import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { jwt_config } from 'src/config/jwt';
import RefreshToken from './entities/refreshtoken.entities';
import { sign, verify } from 'jsonwebtoken';
import { User } from './entities/users.entities';

@Injectable()
export class AuthService {
  private refreshTokens: RefreshToken[] = [];
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }

  async refresh(refreshStr: string): Promise<string | undefined> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);
    if (!refreshToken) {
      return undefined;
    }

    const user = await this.prisma.users.findFirst({
      where: {
        id: refreshToken.userId
      }
    });
    if (!user) {
      return undefined;
    }

    const accessToken = {
      userId: refreshToken.userId,
    };

    return sign(accessToken, process.env.ACCESS_SECRET, { expiresIn: '1h' });
  }

  private retrieveRefreshToken(
    refreshStr: string,
  ): Promise<RefreshToken | undefined> {
    try {
      const decoded = verify(refreshStr, process.env.REFRESH_SECRET);
      if (typeof decoded === 'string') {
        return undefined;
      }
      return Promise.resolve(
        this.refreshTokens.find((token) => token.id === decoded.id),
      );
    } catch (e) {
      return undefined;
    }
  }

  async login(
    email: string,
    password: string,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{ accessToken: string; refreshToken: string } | undefined> {
    const user = await this.prisma.users.findFirst({
      where: {
        email,
      }
    });

    if (!user) {
      return undefined;
    }
    const checkPassword = await compare(
      password,
      user.password,
    );

    // verify your user -- use argon2 for password hashing!!
    if (!checkPassword) {
      return undefined;
    }

    return this.newRefreshAndAccessToken(user, values);
  }

  private async newRefreshAndAccessToken(
    user: User,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshObject = new RefreshToken({
      id:
        user.id,
      ...values,
      userId: user.id,
    });
    this.refreshTokens.push(refreshObject);
    return {
      refreshToken: refreshObject.sign(),
      accessToken: sign(
        {
          sub: user.id,
                name: user.name,
                email: user.email,
        },
        process.env.ACCESS_SECRET,
        {
          expiresIn: '1h',
        },
      ),
    };
  }

  async logout(refreshStr): Promise<void> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);

    if (!refreshToken) {
      return;
    }
    // delete refreshtoken from db
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken) => refreshToken.id !== refreshToken.id,
    );
  }



  async register(data: RegisterDto) {
    const checkUserExists = await this.prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });
    if (checkUserExists) {
      throw new HttpException('User already registered', HttpStatus.FOUND);
    }
    data.password = await hash(data.password, 12);
    const createUser = await this.prisma.users.create({
      data: data,
    });
    if (createUser) {
      return {
        statusCode: 200,
        message: 'Register Successfull',
      };
    }
  }

  // async login(data: LoginDto) {
  //   const checkUserExists = await this.prisma.users.findFirst({
  //     where: {
  //       email: data.email,
  //     },
  //   });

  //   if (!checkUserExists) {
  //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //   }

  //   const checkPassword = await compare(
  //     data.password,
  //     checkUserExists.password,
  //   );

  //   if (checkPassword) {
  //     const accessToken = this.generateJWT({
  //       sub: checkUserExists.id,
  //       name: checkUserExists.name,
  //       email: checkUserExists.email,
  //     });

  //     return {
  //       statusCode: 200,
  //       message: 'Login berhasil',
  //       accessToken: accessToken,
  //     };
  //   } else {
  //     throw new HttpException(
  //       'User or password not match',
  //       HttpStatus.UNAUTHORIZED,
  //     );
  //   }
  // }

  // generateJWT(payload: any) {
  //   return this.jwtService.sign(payload, {
  //     secret: jwt_config.secret,
  //     expiresIn: jwt_config.expired,
  //   });
  // }

  async profile(user_id: number) {
    return await this.prisma.users.findFirst({
      where: {
        id: user_id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}