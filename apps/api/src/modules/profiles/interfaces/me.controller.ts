import { Body, Controller, Get, Header, Patch, UseGuards } from '@nestjs/common';
import {
  type MeResponse,
  type UpdateProfileRequest,
  UpdateProfileRequestSchema,
} from '@cv-rush/contracts';
import { ZodValidationPipe } from '../../../platform/http/zod-validation.pipe.js';
import { CurrentDeveloper, DeveloperAuthGuard } from '../../identity/index.js';
import { GetMe, UpdateProfile } from '../application/profile-use-cases.js';

/** The current Developer, resolved from the device credential. Private to its owner. */
@Controller('v1/me')
@UseGuards(DeveloperAuthGuard)
export class MeController {
  constructor(
    private readonly getMe: GetMe,
    private readonly updateProfile: UpdateProfile,
  ) {}

  @Get()
  @Header('cache-control', 'no-store')
  me(@CurrentDeveloper() developerId: string): Promise<MeResponse> {
    return this.getMe.execute(developerId);
  }

  @Patch('profile')
  @Header('cache-control', 'no-store')
  update(
    @CurrentDeveloper() developerId: string,
    @Body(new ZodValidationPipe(UpdateProfileRequestSchema)) body: UpdateProfileRequest,
  ): Promise<MeResponse> {
    return this.updateProfile.execute(developerId, body);
  }
}
