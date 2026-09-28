import { BadRequestException, Injectable } from '@nestjs/common';
import { ClockInDto } from './dto/clock-in.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AttendanceHistoryDto,
  AttendanceHistoryStatus,
} from './dto/attendance-history.dto.js';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto.js';
import { Prisma } from '../../generated/prisma/client.js';

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
      throw new BadRequestException(
        'Start date cannot be greater than end date',
      );
    }

    const today = new Date(
      new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Jakarta',
      }),
    );

    if (endDate > today) {
      throw new BadRequestException('Date cannot be greater than today');
    }

    if (userRole === 'EMPLOYEE' && endDate >= today) {
      endDate.setUTCDate(today.getUTCDate() - 1);
    }

    const page = dto.page ?? 1;
    const limit = 10;

    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }

    const offset = (page - 1) * limit;

    const userCondition =
      userRole === 'ADMIN'
        ? Prisma.sql`u."role" = 'EMPLOYEE'`
        : Prisma.sql`u."id" = ${userId}`;

    const statusCondition = dto.status
      ? Prisma.sql`
        AND (
          CASE
            WHEN a."id" IS NULL THEN 'Absent'
            WHEN a."clockOut" IS NOT NULL THEN 'Present'
            ELSE 'Clocked In'
          END
        ) = ${dto.status}
      `
      : Prisma.empty;

    const totalResult = await this.prisma.$queryRaw<
      { total: bigint }[]
    >(Prisma.sql`
    SELECT COUNT(*) AS total
    FROM "users" u
    CROSS JOIN generate_series(
      ${startDate}::date,
      ${endDate}::date,
      INTERVAL '1 day'
    ) AS dates("date")
    LEFT JOIN "attendances" a
      ON a."userId" = u."id"
      AND a."date" = dates."date"
    WHERE ${userCondition}
    ${statusCondition}
  `);

    const total = Number(totalResult[0]?.total ?? 0);
    const totalPages = Math.ceil(total / limit);

    if (offset >= total) {
      return {
        message: 'Attendance history retrieved successfully',
        data: [],
        paging: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }

    const rows = await this.prisma.$queryRaw<
      {
        name: string;
        date: Date;
        clockIn: Date | null;
        clockOut: Date | null;
        status: AttendanceHistoryStatus;
      }[]
    >(Prisma.sql`
    SELECT
      u."name" AS "name",
      dates."date" AS "date",
      a."clockIn" AS "clockIn",
      a."clockOut" AS "clockOut",

      CASE
        WHEN a."id" IS NULL THEN 'Absent'
        WHEN a."clockOut" IS NOT NULL THEN 'Present'
        ELSE 'Clocked In'
      END AS "status"

    FROM "users" u

    CROSS JOIN generate_series(
      ${startDate}::date,
      ${endDate}::date,
      INTERVAL '1 day'
    ) AS dates("date")

    LEFT JOIN "attendances" a
      ON a."userId" = u."id"
      AND a."date" = dates."date"

    WHERE ${userCondition}

    ${statusCondition}

    ORDER BY
      dates."date" ASC,
      u."name" ASC

    OFFSET ${offset}
    LIMIT ${limit}
  `);

    const data = rows.map((row) => ({
      name: row.name,
      date: row.date.toISOString().split('T')[0],
      clockIn: row.clockIn,
      clockOut: row.clockOut,
      status: row.status,
    }));

    return {
      message: 'Attendance history retrieved successfully',
      data,
      paging: {
        page,
        limit,
        total,
        totalPages,
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

    if (startDate > today) {
      throw new BadRequestException('Date cannot be greater than today');
    }

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
