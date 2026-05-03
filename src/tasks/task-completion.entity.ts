import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('task_completions')
@Unique(['userId', 'campaignId'])
export class TaskCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @Index()
  @Column()
  campaignId: string;

  @CreateDateColumn()
  completedAt: Date;
}
