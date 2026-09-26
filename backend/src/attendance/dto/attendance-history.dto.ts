import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum AttendanceHistoryStatus {
  PRESENT = 'Present',
  CLOCKED_IN = 'Clocked In',
  ABSENT = 'Absent',
  '' = '',
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
}
