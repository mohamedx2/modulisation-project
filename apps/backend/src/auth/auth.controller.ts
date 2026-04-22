import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { KeycloakUser } from './interfaces/keycloak-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  async getProfile(@AuthenticatedUser() keycloakUser: KeycloakUser) {
    const user = await this.authService.syncUser(keycloakUser);
    return {
      message: 'Profile synchronized successfully',
      keycloakUser,
      databaseUser: user,
    };
  }
}
