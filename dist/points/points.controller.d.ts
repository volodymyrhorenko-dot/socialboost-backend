import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { Repository } from 'typeorm';
import { DailyBonus } from './daily-bonus.entity';
export declare class PointsController {
    private usersService;
    private transactionsService;
    private dailyBonusRepo;
    constructor(usersService: UsersService, transactionsService: TransactionsService, dailyBonusRepo: Repository<DailyBonus>);
    claimDaily(req: any): Promise<{
        success: boolean;
        points: number;
        balanceAfter: number;
    }>;
    watchAd(req: any): Promise<{
        success: boolean;
        points: number;
        balanceAfter: number;
    }>;
}
