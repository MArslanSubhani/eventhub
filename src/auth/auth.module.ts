import { Module } from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt'
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports:[
    PrismaModule,
    ConfigModule,
    PassportModule.register({
      defaultStrategy:'jwt',
    }),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
     useFactory:(configService:ConfigService)=>({
      secret:configService.getOrThrow<string>('JWT_SECRET'),
      signOptions:{
        expiresIn:'1d',
      },
     }),
    }),

  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,JwtAuthGuard,RolesGuard],
  exports:[AuthService,JwtAuthGuard,RolesGuard]
})
export class AuthModule {}
