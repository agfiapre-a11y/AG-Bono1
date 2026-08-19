import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepo.findOneBy({ slug: dto.slug });
    if (existing) {
      throw new ConflictException('Tenant slug already exists');
    }
    const tenant = this.tenantRepo.create({
      ...dto,
      subscriptionTier: dto.subscriptionTier ?? 'basic',
      primaryColor: dto.primaryColor ?? '#2E7D32',
      secondaryColor: dto.secondaryColor ?? '#FFD600',
      maxMembers: dto.maxMembers ?? 500,
      enabledModules: dto.enabledModules ?? ['members', 'attendance', 'finance', 'sermons', 'events', 'welfare'],
      isActive: true,
    });
    return this.tenantRepo.save(tenant);
  }

  findAll(): Promise<Tenant[]> {
    return this.tenantRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOneBy({ slug });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOneBy({ id });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (dto.slug && dto.slug !== tenant.slug) {
      const existing = await this.tenantRepo.findOneBy({ slug: dto.slug });
      if (existing) {
        throw new ConflictException('Tenant slug already exists');
      }
    }
    Object.assign(tenant, dto);
    return this.tenantRepo.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findById(id);
    tenant.isActive = false;
    await this.tenantRepo.save(tenant);
  }

  async findAllPublicBranding() {
    const tenants = await this.tenantRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    return tenants.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      appName: t.appName,
      primaryColor: t.primaryColor || '#2E7D32',
      secondaryColor: t.secondaryColor || '#FFD600',
      logoUrl: t.logoUrl,
      bannerUrl: t.bannerUrl,
      motto: t.motto,
      address: t.address,
      phone: t.phone,
      email: t.email,
      subscriptionTier: t.subscriptionTier,
    }));
  }

  async findPublicBranding(slug: string) {
    const tenant = await this.tenantRepo.findOneBy({ slug, isActive: true });
    if (!tenant) {
      throw new NotFoundException('Church not found');
    }
    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      appName: tenant.appName,
      primaryColor: tenant.primaryColor || '#2E7D32',
      secondaryColor: tenant.secondaryColor || '#FFD600',
      logoUrl: tenant.logoUrl,
      bannerUrl: tenant.bannerUrl,
      motto: tenant.motto,
      address: tenant.address,
      phone: tenant.phone,
      email: tenant.email,
      aboutText: tenant.aboutText,
      mission: tenant.mission,
      vision: tenant.vision,
      pastorMessage: tenant.pastorMessage,
      facebookUrl: tenant.facebookUrl,
      instagramUrl: tenant.instagramUrl,
      twitterUrl: tenant.twitterUrl,
      enabledModules: tenant.enabledModules,
      maxMembers: tenant.maxMembers,
    };
  }
}
