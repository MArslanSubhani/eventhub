import { Injectable,ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(private readonly prisma:PrismaService,
        private readonly jwtService:JwtService,
    ){}

    async register(registerDto:RegisterDto){
        const {name,email,password}=registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where:{email,},
        });
        if(existingUser){
            throw new ConflictException('Email already registered')
        }
        const hashedPassword= await bcrypt.hash(password,12);
        const user= await this.prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword,
            },
            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                createdAt:true,
            },
        });
        return {Message:'Register User Successfully',user}
    };


    async login(loginDto:LoginDto){
        const{email,password}=loginDto;
        const user = await this.prisma.user.findUnique({
            where:{email,},
        });
        if(!user){
            throw new UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            throw new UnauthorizedException('Invalid email or password');
        }
        const payload ={
            sub: user.id,
            email:user.email,
            role:user.role,
        };
        const accessToken = await this.jwtService.signAsync(payload);

        return {message:'Login Successful', access_token:accessToken,
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role
            },};
    };
    async getProfile(userID:string){
        const user = await this.prisma.user.findUnique({
            where:{id:userID},
            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                createdAt:true,
                updatedAt:true
            },

        });
         if (!user) {
         throw new UnauthorizedException('User no longer exists');
           }

        return user;
    }
}

