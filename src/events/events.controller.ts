import { Body, Controller, Post, UseGuards, Req, Param, Patch, Get, Query} from '@nestjs/common';
import type { Request } from 'express';
import { EventsService } from './events.service.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { UpdateEventDto } from './dto/update-event.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { EventFilterDto } from './dto/event-filter.dto.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @Post()
  createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.createEvent(
      createEventDto,
      req.user.id,
    );
  }

  // UPDATE EVENT
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
@Patch(':id')
updateEvent(
  @Param('id') eventId: string,
  @Body() updateEventDto: UpdateEventDto,
  @Req() req: AuthenticatedRequest,
) {
  return this.eventsService.updateEvent(
    eventId,
    req.user.id,
    updateEventDto,
  );
}
// PUBLISH EVENT
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
@Patch(':id/publish')
publishEvent(
  @Param('id') eventId: string,
  @Req() req: AuthenticatedRequest,
) {
  return this.eventsService.publishEvent(
    eventId,
    req.user.id,
  );
}
// CANCEL EVENT
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
@Patch(':id/cancel')
cancelEvent(
  @Param('id') eventId: string,
  @Req() req: AuthenticatedRequest,
) {
  return this.eventsService.cancelEvent(
    eventId,
    req.user.id,
  );
}
// GET ALL UPCOMING EVENTS
@Get()
getAllEvents(@Query()filters:EventFilterDto) {
  return this.eventsService.getAllEvents(filters);
}
// GET ORGANIZER'S OWN EVENTS WITH STATUS FILTER
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ORGANIZER')
@Get('my-events')
getOrganizerEvents(
  @Req() req: AuthenticatedRequest,
  @Query() filters: EventFilterDto,
) {
  return this.eventsService.getOrganizerEvents(
    req.user.id,
    filters.status,
  );
}
// GET SINGLE EVENT
@Get(':id')
getEventById(@Param('id') eventId: string) {
  return this.eventsService.getEventById(eventId);
}
}