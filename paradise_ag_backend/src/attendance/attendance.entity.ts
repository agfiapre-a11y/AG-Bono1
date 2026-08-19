import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'service_type', type: 'varchar', length: 100 })
  serviceType: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'present_member_ids', type: 'json', default: [] })
  presentMemberIds: string[];

  @Column({ name: 'recorded_by_id', type: 'uuid' })
  recordedById: string;

  @Column({ name: 'ministry_type', type: 'varchar', length: 100, nullable: true })
  ministryType: string | null;

  // GPS location of the attendance session creator
  @Column({ name: 'latitude', type: 'double precision', nullable: true })
  latitude: number | null;

  @Column({ name: 'longitude', type: 'double precision', nullable: true })
  longitude: number | null;

  // Proximity radius in meters — members within this radius can self-check-in
  @Column({ name: 'proximity_radius', type: 'integer', default: 100 })
  proximityRadius: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Event linking — optional reference to an event
  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId: string | null;

  @Column({ name: 'event_title', type: 'varchar', length: 255, nullable: true })
  eventTitle: string | null;

  // Expiry — when the self-check-in window closes
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  // Target audience — controls which users see the session
  @Column({ name: 'audience', type: 'varchar', length: 50, default: 'everyone' })
  audience: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
