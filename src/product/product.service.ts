import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {

    constructor(private prisma: PrismaService) { }

    async getAllProducts() {
        return await this.prisma.products.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                image: true,
                reviews: true
            }
        })
    }

    async addProduct(data) {
        const createProduct = await this.prisma.products.create({
            data,
        });
        if (createProduct) {
            return {
                statusCode: 200,
                message: 'Product Added Successfull',
            };
        }
    }
}
