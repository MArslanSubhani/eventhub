import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import {NotFoundException,ForbiddenException, BadRequestException} from '@nestjs/common';
import { EventFilterDto } from './dto/event-filter.dto.js';

import { UpdateEventDto } from './dto/update-event.dto.js';

@Injectable()
export class EventsService {
    constructor(private readonly prisma:PrismaService){}

    async createEvent(createEventDto:CreateEventDto,organizerId:string){
      const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        location: createEventDto.location,
        startDate: new Date(createEventDto.startDate),
        totalSeats: createEventDto.totalSeats,

        // Backend automatically manages these fields
        availableSeats: createEventDto.totalSeats,
        status: 'DRAFT',
        organizerId: organizerId,
        },
      });

     return {
      message: 'Event created successfully',
      event,
      };
  
    }
    async updateEvent(
  eventId: string,
  organizerId: string,
  updateEventDto: UpdateEventDto,
) {
  const event = await this.prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!event) {
    throw new NotFoundException('Event not found');
  }

  // Ownership authorization
  if (event.organizerId !== organizerId) {
    throw new ForbiddenException(
      'You can only update your own events',
    );
  }
  const bookedSeats = event.totalSeats - event.availableSeats;

if (
  updateEventDto.totalSeats !== undefined &&
  updateEventDto.totalSeats < bookedSeats
) {
  throw new BadRequestException(
    `Total seats cannot be less than already booked seats (${bookedSeats})`,
  );
}

  const updatedEvent = await this.prisma.event.update({
    where: {
      id: eventId,
    },
    data: {
      ...updateEventDto,
      ...(updateEventDto.startDate && {
        startDate: new Date(updateEventDto.startDate),
      }),
      ...(updateEventDto.totalSeats !== undefined && {
        availableSeats:
          event.availableSeats +
          (updateEventDto.totalSeats - event.totalSeats),
      }),
    },
  });

  return {
    message: 'Event updated successfully',
    event: updatedEvent,
  };
}
async publishEvent(eventId: string, organizerId: string) {
  const event = await this.prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new NotFoundException('Event not found');
  }

  if (event.organizerId !== organizerId) {
    throw new ForbiddenException(
      'You can only publish your own events',
    );
  }

  if (event.status === 'CANCELLED') {
    throw new BadRequestException(
      'Cancelled events cannot be published',
    );
  }

  const publishedEvent = await this.prisma.event.update({
    where: { id: eventId },
    data: {
      status: 'PUBLISHED',
    },
  });

  return {
    message: 'Event published successfully',
    event: publishedEvent,
  };
}
// CANCEL EVENT
async cancelEvent(eventId: string, organizerId: string) {
  const event = await this.prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new NotFoundException('Event not found');
  }

  if (event.organizerId !== organizerId) {
    throw new ForbiddenException(
      'You can only cancel your own events',
    );
  }

  if (event.status === 'CANCELLED') {
    throw new BadRequestException('Event is already cancelled');
  }

  const cancelledEvent = await this.prisma.event.update({
    where: { id: eventId },
    data: {
      status: 'CANCELLED',
    },
  });

  return {
    message: 'Event cancelled successfully',
    event: cancelledEvent,
  };
}
// GET ALL UPCOMING PUBLISHED EVENTS
// GET ALL EVENTS WITH SEARCH AND FILTERS
async getAllEvents(filters: EventFilterDto) {
  const { search, location, date, page = 1, limit = 10 } = filters;

  const where: any = {
    status: 'PUBLISHED',
    startDate: {
      gte: new Date(),
    },
  };

  // SEARCH BY TITLE OR LOCATION
  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        location: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }

  // FILTER BY LOCATION
  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    };
  }

  // FILTER BY DATE
  if (date) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    where.startDate = {
      gte: startOfDay > new Date() ? startOfDay : new Date(),
      lt: endOfDay,
    };
  }

 const skip = (page - 1) * limit;

const [events, totalEvents] = await Promise.all([
  this.prisma.event.findMany({
    where,
    orderBy: {
      startDate: 'asc',
    },
    skip,
    take: limit,
  }),

  this.prisma.event.count({
    where,
  }),
]);

return {
  data: events,
  pagination: {
    totalEvents,
    currentPage: page,
    limit,
    totalPages: Math.ceil(totalEvents / limit),
    hasNextPage: page * limit < totalEvents,
    hasPreviousPage: page > 1,
  },
}
}
// GET SINGLE EVENT
async getEventById(eventId: string) {
  const event = await this.prisma.event.findFirst({
  where: {
    id: eventId,
    status: 'PUBLISHED',
    },
  });

  if (!event) {
    throw new NotFoundException('Event not found');
  }

  return event;
}
}

