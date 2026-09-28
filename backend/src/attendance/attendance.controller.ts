import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { ClockInDto } from './dto/clock-in.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AttendanceHistoryDto } from './dto/attendance-history.dto.js';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { type jwtFullInterface } from '../types/jwt.js';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  async clockIn(@Req() req: jwtFullInterface, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(req.user.sub, dto);
  }

  @Get('today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  async getToday(@Req() req: jwtFullInterface) {
    return this.attendanceService.getToday(req.user.sub);
  }

  @Patch('clock-out')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYEE')
  async clockOut(@Req() req: jwtFullInterface) {
    return this.attendanceService.clockOut(req.user.sub);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Req() req: jwtFullInterface,
    @Query() dto: AttendanceHistoryDto,
  ) {
    return this.attendanceService.getHistory(req.user.sub, req.user.role, dto);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSummary(@Query() dto: AttendanceSummaryDto) {
    return this.attendanceService.getSummary(dto);
  }
}
