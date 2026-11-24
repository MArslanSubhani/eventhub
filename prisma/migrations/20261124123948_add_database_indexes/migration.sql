-- DropIndex
DROP INDEX "Booking_attendeeId_idx";

-- DropIndex
DROP INDEX "Booking_eventId_idx";

-- CreateIndex
CREATE INDEX "Booking_attendeeId_status_idx" ON "Booking"("attendeeId", "status");

-- CreateIndex
CREATE INDEX "Booking_eventId_status_idx" ON "Booking"("eventId", "status");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_status_startDate_idx" ON "Event"("status", "startDate");
