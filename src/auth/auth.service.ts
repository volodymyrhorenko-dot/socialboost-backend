import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthProvider } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async googleAuth(googleData: { email: string; displayName?: string; avatarUrl?: string }) {
    let user = await this.usersService.findByEmail(googleData.email);

    if (!user) {
      user = await this.usersService.create({
        email: googleData.email,
        displayName: googleData.displayName,
        avatarUrl: googleData.avatarUrl,
        authProvider: AuthProvider.GOOGLE,
        pointBalance: 500, // стартовий бонус
      });
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async appleAuth(appleData: { email: string; displayName?: string }) {
    let user = await this.usersService.findByEmail(appleData.email);

    if (!user) {
      user = await this.usersService.create({
        email: appleData.email,
        displayName: appleData.displayName,
        authProvider: AuthProvider.APPLE,
        pointBalance: 500,
      });
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user, token };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}