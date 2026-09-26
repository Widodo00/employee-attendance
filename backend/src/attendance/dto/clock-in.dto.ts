import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class ClockInDto {
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @IsNumber()
  @IsLongitude()
  longitude: number;
}
