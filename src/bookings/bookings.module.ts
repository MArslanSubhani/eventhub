import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports:[PrismaModule, AuthModule ],
  controllers: [BookingsController],
  providers: [BookingsService]
})
export class BookingsModule {}
