export declare enum TransactionType {
    EARN = "earn",
    SPEND = "spend",
    PURCHASE = "purchase",
    BONUS = "bonus"
}
export declare class Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    description: string;
    balanceAfter: number;
    createdAt: Date;
}
