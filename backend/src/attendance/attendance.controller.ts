import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service.js';
import { ClockInDto } from './dto/clock-in.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @UseGuards(JwtAuthGuard)
  async clockIn(@Req() req: any, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(req.user.sub, dto);
  }

  @Get('today')
  @UseGuards(JwtAuthGuard)
  async getToday(@Req() req: any) {
    return this.attendanceService.getToday(req.user.sub);
  }

  @Post('clock-out')
  @UseGuards(JwtAuthGuard)
  async clockOut(@Req() req: any) {
    return this.attendanceService.clockOut(req.user.sub);
  }
}
