import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('products')
export class ProductController {
    constructor(private product: ProductService) {

    }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getAllProducts() {
        return await this.product.getAllProducts();
    }

    @UseGuards(JwtAuthGuard)
    @Post('add')
    async addProduct(@Body() data: ProductDto) {
        return await this.product.addProduct(data);
    }
}
