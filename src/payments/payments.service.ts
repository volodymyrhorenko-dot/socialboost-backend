import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';

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
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-03-31.basil',
    });
  }

  async createCheckoutSession(userId: string, packageId: string) {
    const pkg = PACKAGES[packageId];
    if (!pkg) throw new BadRequestException('Invalid package');

    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.name,
            description: pkg.points + ' балів для SocialBoost',
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://socialboost-backend-production-6980.up.railway.app/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://socialboost-backend-production-6980.up.railway.app/api/v1/payments/cancel',
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
      const { userId, points } = session.metadata;
      await this.usersService.updatePoints(userId, parseInt(points));
    }
    return { received: true };
  }

  async handleSuccess(sessionId: string) {
  try {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      const { userId, points } = session.metadata;
      await this.usersService.updatePoints(userId, parseInt(points));
    }
  } catch (e) {
    console.error('Handle success error:', e);
  }
}

}
