import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakUser } from './interfaces/keycloak-user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUser(keycloakUser: KeycloakUser) {
    const { email, name } = keycloakUser;

    // Keycloak typically sets these, but fallback safely
    if (!email) return null;

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        name,
        // Since Keycloak is handling passwords, we can just store a dummy hash.
        password: 'sso-user',
      },
      create: {
        email,
        name,
        password: 'sso-user',
      },
    });

    return user;
  }
}
