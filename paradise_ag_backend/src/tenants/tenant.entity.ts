import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ name: 'primary_color', type: 'varchar', length: 7, default: '#2E7D32' })
  primaryColor: string;

  @Column({ name: 'secondary_color', type: 'varchar', length: 7, default: '#FFD600' })
  secondaryColor: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ name: 'banner_url', type: 'varchar', length: 500, nullable: true })
  bannerUrl: string;

  @Column({ name: 'app_name', type: 'varchar', length: 255, nullable: true })
  appName: string;

  // Usage limits
  @Column({ name: 'max_members', type: 'int', default: 500 })
  maxMembers: number;

  // Subscription tracking
  @Column({ name: 'subscription_tier', type: 'varchar', length: 50, default: 'basic' })
  subscriptionTier: string;

  @Column({ name: 'subscription_expiry', type: 'varchar', length: 30, nullable: true })
  subscriptionExpiry: string;

  // Module gating
  @Column({ name: 'enabled_modules', type: 'simple-array', default: 'members,attendance,finance,sermons,events,welfare' })
  enabledModules: string[];

  // Branding & website content
  @Column({ type: 'text', nullable: true })
  motto: string;

  @Column({ name: 'about_text', type: 'text', nullable: true })
  aboutText: string;

  @Column({ type: 'text', nullable: true })
  mission: string;

  @Column({ type: 'text', nullable: true })
  vision: string;

  @Column({ name: 'pastor_message', type: 'text', nullable: true })
  pastorMessage: string;

  @Column({ name: 'facebook_url', type: 'varchar', length: 500, nullable: true })
  facebookUrl: string;

  @Column({ name: 'instagram_url', type: 'varchar', length: 500, nullable: true })
  instagramUrl: string;

  @Column({ name: 'twitter_url', type: 'varchar', length: 500, nullable: true })
  twitterUrl: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
