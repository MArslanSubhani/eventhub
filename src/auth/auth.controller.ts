import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}
    @Post('register')
    register(@Body() registorDto:RegisterDto){
        return this.authService.register(registorDto)
    }
    @Post('login')
    login(@Body()loginDto:LoginDto){
        return this.authService.login(loginDto);
    }
    @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.id)
  }
}
