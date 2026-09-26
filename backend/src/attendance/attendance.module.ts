import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller.js';
import { AttendanceService } from './attendance.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, PrismaService],
})
export class AttendanceModule {}
