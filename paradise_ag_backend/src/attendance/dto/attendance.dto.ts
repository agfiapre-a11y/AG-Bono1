import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  serviceType: string;

  @IsDateString()
  date: string;

  @IsString()
  recordedById: string;

  @IsString()
  @IsOptional()
  ministryType?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @Min(10)
  @Max(5000)
  @IsOptional()
  proximityRadius?: number;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  eventTitle?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsString()
  @IsOptional()
  audience?: string;
}

export class UpdateAttendanceDto {
  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  ministryType?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @Min(10)
  @Max(5000)
  @IsOptional()
  proximityRadius?: number;
}

export class SelfCheckInDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
