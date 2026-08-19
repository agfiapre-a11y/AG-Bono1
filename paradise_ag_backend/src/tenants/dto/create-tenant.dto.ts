import {
  IsString,
  MinLength,
  IsOptional,
  IsEmail,
  IsHexColor,
  IsIn,
  IsInt,
  IsArray,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsHexColor()
  @IsOptional()
  primaryColor?: string;

  @IsHexColor()
  @IsOptional()
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsString()
  @IsOptional()
  appName?: string;

  @IsInt()
  @IsOptional()
  maxMembers?: number;

  @IsString()
  @IsOptional()
  @IsIn(['basic', 'standard', 'premium'])
  subscriptionTier?: string;

  @IsString()
  @IsOptional()
  subscriptionExpiry?: string;

  @IsArray()
  @IsOptional()
  enabledModules?: string[];

  // Branding
  @IsString()
  @IsOptional()
  motto?: string;

  @IsString()
  @IsOptional()
  aboutText?: string;

  @IsString()
  @IsOptional()
  mission?: string;

  @IsString()
  @IsOptional()
  vision?: string;

  @IsString()
  @IsOptional()
  pastorMessage?: string;

  @IsString()
  @IsOptional()
  facebookUrl?: string;

  @IsString()
  @IsOptional()
  instagramUrl?: string;

  @IsString()
  @IsOptional()
  twitterUrl?: string;
}
