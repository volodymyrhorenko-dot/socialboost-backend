import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthProvider } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationPriority } from '../notifications/enums/notification-priority.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async register(data: { email: string; password: string; displayName?: string }) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) throw new BadRequestException('Користувач з таким email вже існує');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      email: data.email,
      displayName: data.displayName || data.email.split('@')[0],
      passwordHash,
      authProvider: AuthProvider.EMAIL,
      pointBalance: 500,
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    try {
      await this.notificationsService.create({
        userId: user.id,
        type: NotificationType.WELCOME_BONUS,
        priority: NotificationPriority.HIGH,
        title: 'Вітаємо в SurgeUp! 🎉',
        body: 'Ми додали 500 балів на твій баланс. Спробуй платформу безкоштовно!',
        icon: '🎁',
        actionLabel: 'Почати',
        actionLink: '/dashboard',
      });
    } catch (e) {
      console.error('Failed to create notification', e);
    }
    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new UnauthorizedException('Невірний email або пароль');
    if (!user.passwordHash) throw new UnauthorizedException('Використовуйте Google або Apple для входу');

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Невірний email або пароль');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async googleAuth(data: { email: string; displayName?: string; avatarUrl?: string }) {
    let user = await this.usersService.findByEmail(data.email);
    if (!user) {
      user = await this.usersService.create({
        email: data.email,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        authProvider: AuthProvider.GOOGLE,
        pointBalance: 500,
      });
      try {
        await this.notificationsService.create({
          userId: user.id,
          type: NotificationType.WELCOME_BONUS,
          priority: NotificationPriority.HIGH,
          title: 'Вітаємо в SurgeUp! 🎉',
          body: 'Ми додали 500 балів на твій баланс. Спробуй платформу безкоштовно!',
          icon: '🎁',
          actionLabel: 'Почати',
          actionLink: '/dashboard',
        });
      } catch (e) {
        console.error('Failed to create notification', e);
      }
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async appleAuth(data: { email: string; displayName?: string }) {
    let user = await this.usersService.findByEmail(data.email);
    if (!user) {
      user = await this.usersService.create({
        email: data.email,
        displayName: data.displayName,
        authProvider: AuthProvider.APPLE,
        pointBalance: 500,
      });
      try {
        await this.notificationsService.create({
          userId: user.id,
          type: NotificationType.WELCOME_BONUS,
          priority: NotificationPriority.HIGH,
          title: 'Вітаємо в SurgeUp! 🎉',
          body: 'Ми додали 500 балів на твій баланс. Спробуй платформу безкоштовно!',
          icon: '🎁',
          actionLabel: 'Почати',
          actionLink: '/dashboard',
        });
      } catch (e) {
        console.error('Failed to create notification', e);
      }
    }
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}