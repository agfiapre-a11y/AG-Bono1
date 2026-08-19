import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from './attendance.entity';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  SelfCheckInDto,
} from './dto/attendance.dto';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly repo: Repository<AttendanceRecord>,
  ) {}

  private ensureTenantScope(user: AuthenticatedUser, tenantId: string) {
    if (user.role === 'super_system_admin') return;
    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }
  }

  findAll(user: AuthenticatedUser, tenantId: string): Promise<AttendanceRecord[]> {
    this.ensureTenantScope(user, tenantId);
    return this.repo.find({
      where: { tenantId, isActive: true },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(
    user: AuthenticatedUser,
    tenantId: string,
    id: string,
  ): Promise<AttendanceRecord> {
    this.ensureTenantScope(user, tenantId);
    const record = await this.repo.findOneBy({ id, tenantId });
    if (!record) throw new NotFoundException('Attendance record not found');
    return record;
  }

  async create(
    user: AuthenticatedUser,
    tenantId: string,
    dto: CreateAttendanceDto,
  ): Promise<AttendanceRecord> {
    this.ensureTenantScope(user, tenantId);
    const record = this.repo.create({
      tenantId,
      serviceType: dto.serviceType,
      date: new Date(dto.date),
      presentMemberIds: [],
      recordedById: dto.recordedById,
      ministryType: dto.ministryType ?? null,
      latitude: dto.latitude ?? null,
      longitude: dto.longitude ?? null,
      proximityRadius: dto.proximityRadius ?? 100,
      isActive: true,
      eventId: dto.eventId ?? null,
      eventTitle: dto.eventTitle ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      audience: dto.audience ?? 'everyone',
    });
    return this.repo.save(record);
  }

  async update(
    user: AuthenticatedUser,
    tenantId: string,
    id: string,
    dto: UpdateAttendanceDto,
  ): Promise<AttendanceRecord> {
    this.ensureTenantScope(user, tenantId);
    const record = await this.findOne(user, tenantId, id);
    if (dto.serviceType !== undefined) record.serviceType = dto.serviceType;
    if (dto.date !== undefined) record.date = new Date(dto.date);
    if (dto.ministryType !== undefined) record.ministryType = dto.ministryType;
    if (dto.isActive !== undefined) record.isActive = dto.isActive;
    if (dto.latitude !== undefined) record.latitude = dto.latitude;
    if (dto.longitude !== undefined) record.longitude = dto.longitude;
    if (dto.proximityRadius !== undefined) record.proximityRadius = dto.proximityRadius;
    return this.repo.save(record);
  }

  async remove(
    user: AuthenticatedUser,
    tenantId: string,
    id: string,
  ): Promise<void> {
    this.ensureTenantScope(user, tenantId);
    const record = await this.findOne(user, tenantId, id);
    record.isActive = false;
    await this.repo.save(record);
  }

  // Admin manually marks a member present
  async markPresent(
    user: AuthenticatedUser,
    tenantId: string,
    id: string,
    memberIds: string[],
  ): Promise<AttendanceRecord> {
    this.ensureTenantScope(user, tenantId);
    const record = await this.findOne(user, tenantId, id);
    const set = new Set(record.presentMemberIds);
    for (const mid of memberIds) set.add(mid);
    record.presentMemberIds = Array.from(set);
    return this.repo.save(record);
  }

  // Admin manually removes a member from present list
  async markAbsent(
    user: AuthenticatedUser,
    tenantId: string,
    id: string,
    memberIds: string[],
  ): Promise<AttendanceRecord> {
    this.ensureTenantScope(user, tenantId);
    const record = await this.findOne(user, tenantId, id);
    const removeSet = new Set(memberIds);
    record.presentMemberIds = record.presentMemberIds.filter(
      (mid) => !removeSet.has(mid),
    );
    return this.repo.save(record);
  }

  // Member self-check-in with GPS proximity validation
  async selfCheckIn(
    user: AuthenticatedUser,
    tenantId: string,
    id: string,
    memberId: string,
    dto: SelfCheckInDto,
  ): Promise<{ success: boolean; distance: number; message: string }> {
    this.ensureTenantScope(user, tenantId);
    const record = await this.findOne(user, tenantId, id);

    if (!record.isActive) {
      throw new BadRequestException('Attendance session is closed');
    }

    // Check expiry — prevent late self-check-ins
    if (record.expiresAt != null && new Date() > record.expiresAt) {
      throw new BadRequestException('Attendance session has expired');
    }

    if (record.latitude == null || record.longitude == null) {
      throw new BadRequestException(
        'Attendance session does not have GPS location set',
      );
    }

    const distance = this.haversineDistance(
      record.latitude,
      record.longitude,
      dto.latitude,
      dto.longitude,
    );

    if (distance > record.proximityRadius) {
      return {
        success: false,
        distance: Math.round(distance),
        message: `You are ${Math.round(distance)}m away. You must be within ${record.proximityRadius}m of the attendance location to check in.`,
      };
    }

    // Add member to present list
    const set = new Set(record.presentMemberIds);
    set.add(memberId);
    record.presentMemberIds = Array.from(set);
    await this.repo.save(record);

    return {
      success: true,
      distance: Math.round(distance),
      message: `Checked in successfully (${Math.round(distance)}m from location).`,
    };
  }

  // Haversine formula to calculate distance between two GPS points in meters
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
