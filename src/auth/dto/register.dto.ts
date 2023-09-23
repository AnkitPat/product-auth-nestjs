import {
    IsString,
    IsNotEmpty,
    IsEmail,
    MinLength,
    MaxLength,
  } from 'class-validator';
  
  export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password: string;
  }