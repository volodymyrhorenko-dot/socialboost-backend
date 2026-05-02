import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  EARN = 'earn',
  SPEND = 'spend',
  PURCHASE = 'purchase',
  BONUS = 'bonus',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column()
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  balanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;
}
