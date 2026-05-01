import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CampaignPlatform {
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
}

export enum CampaignType {
  SUBSCRIBE = 'subscribe',
  LIKE = 'like',
  WATCH = 'watch',
}

export enum CampaignStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @Column({ type: 'enum', enum: CampaignPlatform })
  platform: CampaignPlatform;

  @Column({ type: 'enum', enum: CampaignType })
  type: CampaignType;

  @Column()
  targetUrl: string;

  @Column({ default: 0 })
  targetCount: number;

  @Column({ default: 0 })
  completedCount: number;

  @Column({ default: 10 })
  pointsPerAction: number;

  @Column({ default: 0 })
  totalCost: number;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.ACTIVE })
  status: CampaignStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}