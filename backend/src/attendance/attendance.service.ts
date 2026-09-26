import { BadRequestException, Injectable } from '@nestjs/common';
import { ClockInDto } from './dto/clock-in.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async clockIn(userId: string, dto: ClockInDto) {
    const now = new Date();

    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (existingAttendance) {
      throw new BadRequestException('You have already clocked in today');
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        userId,
        date,
        clockIn: now,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    return {
      message: 'Clock in successful',
      data: {
        id: attendance.id,
        date: attendance.date,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        latitude: attendance.latitude,
        longitude: attendance.longitude,
      },
    };
  }

  async getToday(userId: string) {
    const now = new Date();

    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (!attendance) {
      return {
        message: 'No attendance found for today',
        data: null,
      };
    }

    const endTime = attendance.clockOut ?? now;

    const elapsedSeconds = Math.floor(
      (endTime.getTime() - attendance.clockIn.getTime()) / 1000,
    );

    return {
      message: "Today's attendance",
      data: {
        id: attendance.id,
        date: attendance.date,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        latitude: attendance.latitude,
        longitude: attendance.longitude,
        elapsedSeconds,
      },
    };
  }

  async clockOut(userId: string) {
    const now = new Date();

    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (!attendance) {
      throw new BadRequestException('You have not clocked in today');
    }

    if (attendance.clockOut) {
      throw new BadRequestException('You have already clocked out today');
    }

    const updatedAttendance = await this.prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        clockOut: now,
      },
    });

    const elapsedSeconds = Math.floor(
      (updatedAttendance.clockOut!.getTime() -
        updatedAttendance.clockIn.getTime()) /
        1000,
    );

    return {
      message: 'Clock out successful',
      data: {
        id: updatedAttendance.id,
        date: updatedAttendance.date,
        clockIn: updatedAttendance.clockIn,
        clockOut: updatedAttendance.clockOut,
        latitude: updatedAttendance.latitude,
        longitude: updatedAttendance.longitude,
        elapsedSeconds,
      },
    };
  }
}
