import { Body, Controller, Param, Patch, Post, Request, UseGuards,Get } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Controller('bookings')
@UseGuards(JwtAuthGuard,RolesGuard)
export class BookingsController {
    constructor(private readonly bookingService:BookingsService){}

    @Post()
    @Roles('ATTENDEE')
    createBooking(@Request()req:{user:{id:string}}, @Body()createBookingDto:CreateBookingDto){
        return this.bookingService.createBooking(req.user.id,createBookingDto)
    }
    @Patch(':id/cancel')
    @Roles('ATTENDEE')
    cancelBooking(@Param('id')bookingId:string,@Request()req:{user:{id:string}}){
        return this.bookingService.cancelBooking(bookingId,req.user.id)
    }
    @Get('my-bookings')
    @Roles('ATTENDEE')
    getMyBookings(@Request()req:{user:{id:string}},){
        return this.bookingService.getMyBooking(req.user.id)
    }
    @Get('event/:eventID')
    @Roles("ORGANIZER")
    getEventBooking(@Param('eventID')eventId:string,@Request()req:{user:{id:string}}){
        return this.bookingService.getEventBookings(eventId,req.user.id)
    }
    @Get(':id')
    @Roles('ATTENDEE')
    getBookingById(@Param('id') bookingId: string,@Request() req: { user: { id: string } },) {
        return this.bookingService.getBookingById(bookingId,req.user.id,);
    }
}
