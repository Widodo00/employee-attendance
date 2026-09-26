import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceHistoryStatus {
  ATTENDANCE = 'ATTENDANCE',
  CLOCK_IN = 'CLOCK_IN',
  ABSENT = 'ABSENT',
}

export class AttendanceHistoryDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(AttendanceHistoryStatus)
  status?: AttendanceHistoryStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
