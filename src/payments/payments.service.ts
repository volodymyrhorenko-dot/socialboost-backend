import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/transaction.entity';

const PACKAGES = {
  'pack_500': { points: 500, price: 99, name: '500 балів' },
  'pack_1200': { points: 1200, price: 199, name: '1200 балів' },
  'pack_3000': { points: 3000, price: 399, name: '3000 балів' },
  'pack_8000': { points: 8000, price: 899, name: '8000 балів' },
};

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-03-31.basil',
    });
  }

  async createCheckoutSession(userId: string, packageId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const baseUrl = 'https://surgeup.app/api/v1/payments';

    if (packageId === 'vip_monthly') {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'VIP Місячна підписка', description: '+50% балів, 200 щоденний бонус' },
            unit_amount: 499,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        metadata: { userId, packageId },
      });
      return { url: session.url, sessionId: session.id };
    }

    if (packageId === 'vip_lifetime') {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'VIP Назавжди', description: '+50% балів назавжди, 200 щоденний бонус' },
            unit_amount: 1999,
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        metadata: { userId, packageId },
      });
      return { url: session.url, sessionId: session.id };
    }

    const pkg = PACKAGES[packageId];
    if (!pkg) throw new BadRequestException('Invalid package');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.name,
            description: pkg.points + ' балів для SurgeUp',
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        userId,
        packageId,
        points: pkg.points.toString(),
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(payload: any) {
    const event = payload;
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { userId, packageId, points } = session.metadata;
      if (packageId === 'vip_monthly') {
        await this.usersService.activateVip(userId, 1);
      } else if (packageId === 'vip_lifetime') {
        await this.usersService.activateVip(userId);
      } else if (points) {
        await this.creditPurchase(userId, parseInt(points));
      }
    }
    return { received: true };
  }

  async handleSuccess(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const { userId, packageId, points } = session.metadata;
        if (packageId === 'vip_monthly') {
          await this.usersService.activateVip(userId, 1);
        } else if (packageId === 'vip_lifetime') {
          await this.usersService.activateVip(userId);
        } else if (points) {
          await this.creditPurchase(userId, parseInt(points));
        }
      }
    } catch (e) {
      console.error('Handle success error:', e);
    }
  }

  private async creditPurchase(userId: string, points: number) {
    const existing = await this.transactionsService.findByUser(userId);
    const alreadyCredited = existing.some(t => t.type === TransactionType.PURCHASE && t.amount === points && (Date.now() - new Date(t.createdAt).getTime() < 60000));
    if (alreadyCredited) return;

    const user = await this.usersService.updatePoints(userId, points);
    await this.transactionsService.create({
      userId,
      type: TransactionType.PURCHASE,
      amount: points,
      description: `Покупка ${points} балів`,
      balanceAfter: user.pointBalance,
    });
  }
}