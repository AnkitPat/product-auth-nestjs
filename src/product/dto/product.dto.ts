import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MinLength,
    MaxLength,
    IsUrl,
  } from 'class-validator';
  
  export class ProductDto {
    @IsNotEmpty()
    @IsString()
    title: string;
    @IsNotEmpty()
    description: string;
    @IsString()
    price: string;
    @IsString()
    reviews: string;
    @IsUrl()
    image: string;
  }