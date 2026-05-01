import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskPlatform {
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
}

export enum TaskType {
  SUBSCRIBE = 'subscribe',
  LIKE = 'like',
  WATCH = 'watch',
}

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TaskPlatform })
  platform: TaskPlatform;

  @Column({ type: 'enum', enum: TaskType })
  type: TaskType;

  @Column()
  targetUrl: string;

  @Column()
  targetChannel: string;

  @Column({ default: 10 })
  pointsReward: number;

  @Column({ default: 0 })
  timeRequiredSeconds: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User)
  @JoinColumn()
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}