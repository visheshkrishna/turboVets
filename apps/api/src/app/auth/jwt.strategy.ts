import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Payload received:', payload);
    console.log('JWT Strategy - JWT_SECRET being used:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      console.log('JWT Strategy - User not found for ID:', payload.sub);
      throw new UnauthorizedException();
    }
    console.log('JWT Strategy - User found:', { id: user.id, email: user.email, role: user.role });
    // Return the user in the format expected by guards
    return {
      userId: user.id, // Some guards expect userId
      ...user // Include all user properties
    };
  }
}
