import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  SelfCheckInDto,
} from './dto/attendance.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('tenants/:tenantId/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles(
    'super_system_admin',
    'national_admin',
    'regional_admin',
    'district_admin',
    'area_admin',
    'local_church_admin',
    'senior_pastor',
    'associate_pastor',
    'church_secretary',
    'ministry_head',
    'cell_leader',
    'finance_officer',
    'member',
    'volunteer',
    'guest',
  )
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    return this.attendanceService.findAll(user, tenantId);
  }

  @Get(':id')
  @Roles(
    'super_system_admin',
    'national_admin',
    'regional_admin',
    'district_admin',
    'area_admin',
    'local_church_admin',
    'senior_pastor',
    'associate_pastor',
    'church_secretary',
    'ministry_head',
    'cell_leader',
    'finance_officer',
    'member',
    'volunteer',
    'guest',
  )
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attendanceService.findOne(user, tenantId, id);
  }

  @Post()
  @Roles('super_system_admin', 'national_admin', 'regional_admin', 'district_admin', 'area_admin', 'local_church_admin', 'senior_pastor', 'associate_pastor', 'church_secretary', 'ministry_head', 'youth_ministry_head', 'men_fellowship_head', 'women_fellowship_head', 'children_ministry_head', 'cell_leader')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: CreateAttendanceDto,
  ) {
    return this.attendanceService.create(user, tenantId, dto);
  }

  @Patch(':id')
  @Roles('super_system_admin', 'national_admin', 'regional_admin', 'district_admin', 'area_admin', 'local_church_admin', 'senior_pastor', 'associate_pastor', 'church_secretary', 'ministry_head', 'youth_ministry_head', 'men_fellowship_head', 'women_fellowship_head', 'children_ministry_head', 'cell_leader')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(user, tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('super_system_admin', 'national_admin', 'regional_admin', 'district_admin', 'area_admin', 'local_church_admin', 'church_secretary')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.attendanceService.remove(user, tenantId, id);
  }

  // Admin manually marks members present
  @Post(':id/mark-present')
  @Roles('super_system_admin', 'national_admin', 'regional_admin', 'district_admin', 'area_admin', 'local_church_admin', 'senior_pastor', 'associate_pastor', 'church_secretary', 'ministry_head', 'youth_ministry_head', 'men_fellowship_head', 'women_fellowship_head', 'children_ministry_head', 'cell_leader')
  markPresent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('memberIds') memberIds: string[],
  ) {
    return this.attendanceService.markPresent(user, tenantId, id, memberIds);
  }

  // Admin manually marks members absent
  @Post(':id/mark-absent')
  @Roles('super_system_admin', 'national_admin', 'regional_admin', 'district_admin', 'area_admin', 'local_church_admin', 'senior_pastor', 'associate_pastor', 'church_secretary', 'ministry_head', 'youth_ministry_head', 'men_fellowship_head', 'women_fellowship_head', 'children_ministry_head', 'cell_leader')
  markAbsent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('memberIds') memberIds: string[],
  ) {
    return this.attendanceService.markAbsent(user, tenantId, id, memberIds);
  }

  // Member self-check-in with GPS proximity validation
  @Post(':id/self-checkin')
  @Roles('super_system_admin', 'national_admin', 'regional_admin', 'district_admin', 'area_admin', 'local_church_admin', 'senior_pastor', 'associate_pastor', 'church_secretary', 'ministry_head', 'cell_leader', 'member', 'volunteer', 'guest')
  selfCheckIn(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SelfCheckInDto,
  ) {
    // Use the authenticated user's id as the member id
    return this.attendanceService.selfCheckIn(user, tenantId, id, user.userId, dto);
  }
}
