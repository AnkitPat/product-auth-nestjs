import { Body, Controller, Delete, Get, HttpException, HttpStatus, Ip, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { jwt_config } from 'src/config/jwt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { compare } from 'bcrypt';
import RefreshTokenDto from './dto/refreshtoken.dto';
import { JwtAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private jwtService: JwtService, private prisma: PrismaService) { }

    @Post('register')
    async register(@Body() data: RegisterDto) {
        return await this.authService.register(data);
    }
    @Post('login')
    async login(@Req() request, @Ip() ip: string, @Body() body: LoginDto) {
        return this.authService.login(body.email, body.password, {
            ipAddress: ip,
            userAgent: request.headers['user-agent'],
        });
    }

    @Post('refresh')
    async refreshToken(@Body() body: RefreshTokenDto) {
        return this.authService.refresh(body.refreshToken);
    }

    @Delete('logout')
    async logout(@Body() body: RefreshTokenDto) {
        return this.authService.logout(body.refreshToken);
    }
    // @Post('login')
    // async login(@Body() data: LoginDto) {
    //     console.log(data);

    // const checkUserExists = await this.prisma.users.findFirst({
    //     where: {
    //         email: data.email,
    //     },
    // });

    // if (!checkUserExists) {
    //     throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    // }

    // const checkPassword = await compare(
    //     data.password,
    //     checkUserExists.password,
    // );

    // if (checkPassword) {
    //     const accessToken = this.generateJWT({
    //         sub: checkUserExists.id,
    //         name: checkUserExists.name,
    //         email: checkUserExists.email,
    //     });

    //     return {
    //         statusCode: 200,
    //         message: 'Login success',
    //         accessToken: accessToken,
    //     };
    // } else {
    //     throw new HttpException(
    //         'User or password not match',
    //         HttpStatus.UNAUTHORIZED,
    //     );
    // }
    // }

    generateJWT(payload: any) {
        return this.jwtService.sign(payload, {
            secret: jwt_config.secret,
            expiresIn: jwt_config.expired,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async profile(@Req() req) {
        return await this.authService.profile(req.id);
    }
}