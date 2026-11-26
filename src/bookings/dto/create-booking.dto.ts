
import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  eventId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
