import { BadRequestException, Injectable } from '@nestjs/common';
import { ClockInDto } from './dto/clock-in.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AttendanceHistoryDto,
  AttendanceHistoryStatus,
} from './dto/attendance-history.dto.js';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async clockIn(userId: string, dto: ClockInDto) {
    const now = new Date();
    const date = new Date(
      now.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
      }),
    );

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

    await this.prisma.attendance.create({
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
    };
  }

  async getToday(userId: string) {
    const now = new Date();
    const date = new Date(
      now.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
      }),
    );

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    if (!attendance) {
      return { message: 'Not attendance', data: null };
    }

    const endTime = attendance.clockOut ?? now;

    const elapsedSeconds = Math.max(
      0,
      Math.floor((endTime.getTime() - attendance.clockIn.getTime()) / 1000),
    );

    return {
      message: 'Attendance',
      data: {
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
    const date = new Date(
      now.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
      }),
    );

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

    await this.prisma.attendance.update({
      where: {
        id: attendance.id,
      },
      data: {
        clockOut: now,
      },
    });

    return {
      message: 'Clock out successful',
    };
  }

  async getHistory(
    userId: string,
    userRole: 'EMPLOYEE' | 'ADMIN',
    dto: AttendanceHistoryDto,
  ) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be greater than endDate');
    }

    const today = new Date(
      new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
      }),
    );

    if (userRole === 'EMPLOYEE' && endDate >= today) {
      endDate.setUTCDate(today.getUTCDate() - 1);
    }

    const users = await this.prisma.user.findMany({
      where:
        userRole === 'ADMIN'
          ? {
              role: 'EMPLOYEE',
            }
          : {
              id: userId,
            },
      select: {
        id: true,
        name: true,
      },
    });

    if (users.length === 0) {
      return {
        message: 'No employee found',
        data: [],
        paging: {
          page: dto.page,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const attendances = await this.prisma.attendance.findMany({
      where: {
        userId: {
          in: users.map((user) => user.id),
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const attendanceMap = new Map(
      attendances.map((attendance) => [
        `${attendance.userId}_${attendance.date.toISOString().split('T')[0]}`,
        attendance,
      ]),
    );

    const history: {
      name: string;
      date: string;
      clockIn: Date | null;
      clockOut: Date | null;
      status: AttendanceHistoryStatus;
    }[] = [];

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];

      for (const user of users) {
        const attendance = attendanceMap.get(`${user.id}_${dateKey}`);

        let status: AttendanceHistoryStatus;

        if (!attendance) {
          status = AttendanceHistoryStatus.ABSENT;
        } else if (attendance.clockOut) {
          status = AttendanceHistoryStatus.PRESENT;
        } else {
          status = AttendanceHistoryStatus.CLOCKED_IN;
        }

        if (dto.status && status !== dto.status) {
          continue;
        }

        history.push({
          name: user.name,
          date: dateKey,
          clockIn: attendance?.clockIn ?? null,
          clockOut: attendance?.clockOut ?? null,
          status,
        });
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const total = history.length;

    const page = dto.page ?? 1;
    const limit = 10;

    const skip = (page - 1) * limit;

    const data = history.slice(skip, skip + limit);

    return {
      message: 'Attendance history retrieved successfully',
      data,
      paging: {
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary(dto: AttendanceSummaryDto) {
    const [yearString, monthString] = dto.month.split('-');

    const year = Number(yearString);
    const month = Number(monthString);
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const today = new Date(
      new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
      }),
    );

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const daysInMonth =
      year === currentYear && month === currentMonth
        ? currentDay
        : new Date(year, month, 0).getDate();

    const employees = await this.prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
      },
    });

    const employeeCount = employees.length;

    if (employeeCount === 0) {
      return {
        message: 'Attendance summary retrieved successfully',
        data: {
          employee: 0,
          complete: 0,
          clockedIn: 0,
          notClockedIn: 0,
        },
      };
    }

    const employeeIds = employees.map((employee) => employee.id);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        userId: {
          in: employeeIds,
        },
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        userId: true,
        date: true,
        clockIn: true,
        clockOut: true,
      },
    });

    let complete = 0;
    let clockedIn = 0;

    for (const attendance of attendances) {
      if (attendance.clockOut) {
        complete++;
      } else if (attendance.clockIn) {
        clockedIn++;
      }
    }

    const totalExpectedAttendance = employeeCount * daysInMonth;
    const notClockedIn = totalExpectedAttendance - complete - clockedIn;

    return {
      message: 'Attendance summary retrieved successfully',
      data: {
        employee: employeeCount,
        complete,
        clockedIn,
        notClockedIn,
      },
    };
  }
}
