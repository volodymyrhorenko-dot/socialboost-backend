import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  EMAIL = 'email',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: 0 })
  pointBalance: number;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.GOOGLE })
  authProvider: AuthProvider;

  @Column({ nullable: true })
  tiktokUrl: string;

  @Column({ nullable: true })
  youtubeUrl: string;

  @Column({ nullable: true })
  tiktokHandle: string;

  @Column({ nullable: true })
  youtubeHandle: string;

  @Column({ nullable: true, unique: true })
  youtubeChannelId: string;

  @Column({ nullable: true, type: 'text' })
  youtubeAccessToken: string;

  @Column({ nullable: true, type: 'text' })
  youtubeRefreshToken: string;

  @Column({ nullable: true })
  youtubeTokenExpiry: Date;

  @Column({ nullable: true, type: 'text' })
  tiktokAccessToken: string;

  @Column({ nullable: true, type: 'text' })
  tiktokRefreshToken: string;

  @Column({ nullable: true })
  tiktokTokenExpiry: Date;

  @Column({ nullable: true })
  tiktokOpenId: string;

  @Column({ default: false })
  isVip: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  vipExpiresAt!: Date | null;

  @Column({ nullable: true, type: 'timestamp' })
  vipStartedAt!: Date | null;

  @Column({ default: false })
  isLifetimeVip!: boolean;

  @Column({ default: false })
  isAdmin!: boolean;

  @Column({ default: 0 })
  tasksCompleted: number;

  @Column({ default: 0 })
  campaignsCreated: number;

  @Column({ default: 0 })
  totalPointsEarned: number;

  @Column({ default: 0 })
  totalPointsSpent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}