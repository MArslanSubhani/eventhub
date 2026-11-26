import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { count } from 'console';
import { throttleTime } from 'rxjs';
@Injectable()
export class BookingsService {
    constructor(private readonly prisma:PrismaService){};

    async createBooking(attendeeId:string,createBokkingDto:CreateBookingDto,){
        const{eventId,quantity}=createBokkingDto;
        // 1. Check event exists
        const event = await this.prisma.event.findUnique({
            where:{id:eventId},
        });
        if(!event){
            throw new NotFoundException('Event Not Found')
        }
         // 2. Event must be published
         if(event.status !== "PUBLISHED"){
            throw new BadRequestException('This event is not available for booking')
         }
         // 3. Event must not have started
         if(event.startDate <= new Date()){
            throw new BadRequestException('You cannot book an event that has already started')
         }
        // 4. Check available seats
        if(quantity > event.availableSeats){
            throw new ConflictException('Not enough seats available')
        }
        // 5. Check existing active booking
        const existingBooking = await this.prisma.booking.findFirst({
            where:{
                attendeeId,
                eventId,
                status:'CONFIRMED'
            },
        });
         if (existingBooking) {
        throw new ConflictException('You already have an active booking for this event', );
        }
        // 6. Create booking
        const booking = await this.prisma.booking.create({
            data:{
                attendeeId,
                eventId,
                quantity,
                status:'CONFIRMED'
            },
        });
        // 7. Reduce available seats
        await this.prisma.event.update({
            where:{id:eventId},
            data:{
                availableSeats:{decrement:quantity},
            },
        });
        return{message:'Booking Creatyed Successfuly',booking}
    }

    async cancelBooking(bookingId:string,attendeeId:string){
        // 1. Find booking
        const booking = await this.prisma.booking.findUnique({
            where:{id:bookingId},
        });
        if(!booking){
            throw new NotFoundException('Booking not found')
        }
        // 2. Check ownership
        if(booking.attendeeId !== attendeeId){
            throw new ForbiddenException('You cannot cancel another attendee booking')
        }
        // 3. Check booking status
        if(booking.status === 'CANCELLED'){
            throw new BadRequestException('Booking is already cancelled')
        }
         // 4. Cancel booking
        await this.prisma.booking.update({
            where:{id:bookingId},
            data:{status:'CANCELLED'},
        });
        // 5. Return seats to event
        await this.prisma.event.update({
            where:{id:booking.eventId},
            data:{availableSeats:{increment:booking.quantity}},
        });
        return {message: 'Booking cancelled successfully' };
    }
    async getMyBooking(attendeeId:string){
        const bookings = await this.prisma.booking.findMany({
            where:{attendeeId},
            include:{event:true},
            orderBy:{createdAt:'desc'},
        });
        return{count:bookings.length,bookings}
    }
    async getEventBookings(eventId:string,organizerId:string){
         // 1. Find event
        const event = await this.prisma.event.findUnique({
            where:{id:eventId},
        });
        if(!event){
            throw new NotFoundException("event not Found")
        }
         // 2. Check event ownership
        if(event.organizerId !== organizerId){
            throw new ForbiddenException('You cannot view bookings of another organizer event')
        }
         // 3. Get event bookings
        const bookings = await this.prisma.booking.findMany({
            where:{eventId},
            include:{attendee:{select:{id:true,name:true,email:true,}}},
            orderBy:{createdAt:'desc'},
        });
        return{event:event.title,count:bookings.length,bookings}
    }
    async getBookingById(bookingId: string, attendeeId: string) {
        // 1. Find booking with event details
        const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
        event: true,
        },
        });

        // 2. Check booking exists
        if (!booking) {
        throw new NotFoundException('Booking not found');
        }

        // 3. Check ownership
        if (booking.attendeeId !== attendeeId) {
        throw new ForbiddenException(
       'You cannot view another attendee booking',
        );
        }

       // 4. Return booking details
       return booking;
    }
}
