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
    // JWT payload validation
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      // User not found
      throw new UnauthorizedException();
    }
    // User validated successfully
    // Return the user in the format expected by guards
    return {
      userId: user.id, // Some guards expect userId
      ...user // Include all user properties
    };
  }
}
