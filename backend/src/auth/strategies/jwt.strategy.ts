import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Vet } from '@prisma/client';
import { createPublicKey } from 'crypto';

interface JwtPayload {
  sub: string;
  email: string;
  aud?: string;
  role?: string;
  exp?: number;
}

interface JwkKey {
  kty: string;
  crv?: string;
  kid?: string;
  x?: string;
  y?: string;
  use?: string;
  alg?: string;
}

const JWKS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let jwksCache: { keys: JwkKey[]; fetchedAt: number } | null = null;

async function getJwks(jwksUrl: string): Promise<JwkKey[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return jwksCache.keys;
  }
  const res = await fetch(jwksUrl);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
  const body = (await res.json()) as { keys: JwkKey[] };
  jwksCache = { keys: body.keys, fetchedAt: Date.now() };
  return body.keys;
}

function decodeJwtHeader(rawToken: string): { kid?: string; alg?: string } {
  const parts = rawToken.split('.');
  if (parts.length < 2) throw new UnauthorizedException('Invalid JWT');
  const headerJson = Buffer.from(parts[0], 'base64url').toString('utf8');
  return JSON.parse(headerJson) as { kid?: string; alg?: string };
}

function jwkToPem(jwk: JwkKey): string {
  if (jwk.kty !== 'EC' || !jwk.crv || !jwk.x || !jwk.y) {
    throw new UnauthorizedException('Unsupported JWK key type');
  }
  const publicKey = createPublicKey({
    key: {
      kty: 'EC',
      crv: jwk.crv,
      x: jwk.x,
      y: jwk.y,
    },
    format: 'jwk',
  });
  return publicKey.export({ type: 'spki', format: 'pem' }) as string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const supabaseUrl = configService.get<string>('supabase.url');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
    const jwksUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256', 'HS256'],
      secretOrKeyProvider: async (
        _request: unknown,
        rawJwtToken: string,
        done: (err: Error | null, secret?: string) => void,
      ) => {
        try {
          const header = decodeJwtHeader(rawJwtToken);
          const alg = header.alg || '';

          if (alg === 'HS256') {
            const legacySecret = configService.get<string>('supabase.jwtSecret');
            if (legacySecret) {
              return done(null, legacySecret);
            }
          }

          const kid = header.kid;
          if (!kid) {
            return done(new UnauthorizedException('JWT missing kid'));
          }

          const keys = await getJwks(jwksUrl);
          const jwk = keys.find((k) => k.kid === kid);
          if (!jwk) {
            return done(new UnauthorizedException('No matching key in JWKS'));
          }

          const pem = jwkToPem(jwk);
          done(null, pem);
        } catch (err) {
          done(err instanceof Error ? err : new Error(String(err)));
        }
      },
    });
  }

  async validate(payload: JwtPayload): Promise<Vet> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    let vet = await this.prisma.vet.findUnique({
      where: { authUserId: payload.sub },
    });

    if (!vet) {
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
