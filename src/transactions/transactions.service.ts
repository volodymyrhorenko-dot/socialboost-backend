import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async create(data: { userId: string; type: TransactionType; amount: number; description: string; balanceAfter: number }) {
    const transaction = this.transactionRepo.create(data);
    return this.transactionRepo.save(transaction);
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    return this.transactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
