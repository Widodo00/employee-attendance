import { BadRequestException, Injectable } from '@nestjs/common';
import { ClockInDto } from './dto/clock-in.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AttendanceHistoryDto,
  AttendanceHistoryStatus,
} from './dto/attendance-history.dto.js';
import {
  formatDate,
  formatDateTime,
  getJakartaNow,
  getJakartaToday,
  parseDateOnly,
} from '../helper/time-zone.js';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async clockIn(userId: string, dto: ClockInDto) {
    const now = getJakartaNow();
    const date = getJakartaToday();

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
        date: formatDate(attendance.date),
        clockIn: formatDateTime(attendance.clockIn),
        clockOut: formatDateTime(attendance.clockOut),
        latitude: attendance.latitude,
        longitude: attendance.longitude,
      },
    };
  }

  async getToday(userId: string) {
    const now = getJakartaNow();
    const date = getJakartaToday();

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

    const elapsedSeconds = Math.max(
      0,
      Math.floor((endTime.getTime() - attendance.clockIn.getTime()) / 1000),
    );

    return {
      message: "Today's attendance",
      data: {
        id: attendance.id,
        date: formatDate(attendance.date),
        clockIn: formatDateTime(attendance.clockIn),
        clockOut: formatDateTime(attendance.clockOut),
        latitude: attendance.latitude,
        longitude: attendance.longitude,
        elapsedSeconds,
      },
    };
  }

  async clockOut(userId: string) {
    const now = getJakartaNow();
    const date = getJakartaToday();

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

    const elapsedSeconds = Math.max(
      0,
      Math.floor(
        (updatedAttendance.clockOut!.getTime() -
          updatedAttendance.clockIn.getTime()) /
          1000,
      ),
    );

    return {
      message: 'Clock out successful',
      data: {
        id: updatedAttendance.id,
        date: formatDate(updatedAttendance.date),
        clockIn: formatDateTime(updatedAttendance.clockIn),
        clockOut: formatDateTime(updatedAttendance.clockOut),
        latitude: updatedAttendance.latitude,
        longitude: updatedAttendance.longitude,
        elapsedSeconds,
      },
    };
  }

  async getHistory(
    userId: string,
    userRole: 'EMPLOYEE' | 'ADMIN',
    dto: AttendanceHistoryDto,
  ) {
    const startDate = parseDateOnly(dto.startDate);
    const endDate = parseDateOnly(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be greater than endDate');
    }

    const today = getJakartaToday();

    if (userRole === 'EMPLOYEE' && endDate >= today) {
      endDate.setUTCDate(today.getUTCDate() - 1);
    }

    if (startDate > endDate) {
      return {
        message: 'No attendance history found',
        data: [],
        meta: {
          page: dto.page,
          limit: dto.limit,
          total: 0,
          totalPages: 0,
        },
      };
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
        email: true,
      },
    });

    if (users.length === 0) {
      return {
        message: 'No employee found',
        data: [],
        meta: {
          page: dto.page,
          limit: dto.limit,
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
        `${attendance.userId}_${formatDate(attendance.date)}`,
        attendance,
      ]),
    );

    const history: {
      userId: string;
      name: string;
      email: string;
      date: string;
      clockIn: string | null;
      clockOut: string | null;
      status: AttendanceHistoryStatus;
    }[] = [];

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = formatDate(currentDate);

      for (const user of users) {
        const attendance = attendanceMap.get(`${user.id}_${dateKey}`);

        let status: AttendanceHistoryStatus;

        if (!attendance) {
          status = AttendanceHistoryStatus.ABSENT;
        } else if (attendance.clockOut) {
          status = AttendanceHistoryStatus.ATTENDANCE;
        } else {
          status = AttendanceHistoryStatus.CLOCK_IN;
        }

        if (dto.status && status !== dto.status) {
          continue;
        }

        history.push({
          userId: user.id,
          name: user.name,
          email: user.email,
          date: dateKey,
          clockIn: formatDateTime(attendance?.clockIn ?? null),
          clockOut: formatDateTime(attendance?.clockOut ?? null),
          status,
        });
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const total = history.length;

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const skip = (page - 1) * limit;

    const data = history.slice(skip, skip + limit);

    return {
      message: 'Attendance history retrieved successfully',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSummary(dto: AttendanceSummaryDto) {
    const [yearString, monthString] = dto.month.split('-');

    const year = Number(yearString);
    const month = Number(monthString);

    // Start of month in Asia/Jakarta
    const startDate = new Date(Date.UTC(year, month - 1, 1));

    // Start of next month in Asia/Jakarta
    const endDate = new Date(Date.UTC(year, month, 1));

    const employees = await this.prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
      },
      select: {
        id: true,
      },
    });

    const employeeIds = employees.map((employee) => employee.id);

    if (employeeIds.length === 0) {
      return {
        message: 'Attendance summary retrieved successfully',
        data: {
          month: dto.month,
          employee: 0,
          complete: 0,
          clockedIn: 0,
          notClockedIn: 0,
        },
      };
    }

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
      orderBy: [
        {
          date: 'desc',
        },
        {
          clockIn: 'desc',
        },
      ],
      select: {
        userId: true,
        date: true,
        clockIn: true,
        clockOut: true,
      },
    });

    /**
     * Because an employee can have multiple attendance records
     * in one month, only the latest attendance is used
     * to determine the employee's current summary status.
     */
    const latestAttendanceMap = new Map<string, (typeof attendances)[number]>();

    for (const attendance of attendances) {
      if (!latestAttendanceMap.has(attendance.userId)) {
        latestAttendanceMap.set(attendance.userId, attendance);
      }
    }

    let complete = 0;
    let clockedIn = 0;
    let notClockedIn = 0;

    for (const employee of employees) {
      const attendance = latestAttendanceMap.get(employee.id);

      if (!attendance) {
        notClockedIn++;
        continue;
      }

      if (attendance.clockOut) {
        complete++;
      } else {
        clockedIn++;
      }
    }

    return {
      message: 'Attendance summary retrieved successfully',
      data: {
        month: dto.month,
        employee: employees.length,
        complete,
        clockedIn,
        notClockedIn,
      },
    };
  }
}
