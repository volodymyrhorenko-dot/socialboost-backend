import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('daily_bonuses')
export class DailyBonus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  date: string;

  @Column({ default: 'daily' })
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}