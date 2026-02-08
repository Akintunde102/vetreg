import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Vet } from '@prisma/client';

interface JwtPayload {
  sub: string; // Supabase auth user ID
  email: string;
  aud?: string;
  role?: string;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('supabase.jwtSecret');
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<Vet> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Find or create vet based on Supabase auth user ID
    let vet = await this.prisma.vet.findUnique({
      where: { authUserId: payload.sub },
    });

    if (!vet) {
      // Auto-create vet record on first login
      vet = await this.prisma.vet.create({
        data: {
          authUserId: payload.sub,
          email: payload.email,
          status: 'PENDING_APPROVAL',
          profileCompleted: false,
        },
      });
    }

    return vet;
  }
}
