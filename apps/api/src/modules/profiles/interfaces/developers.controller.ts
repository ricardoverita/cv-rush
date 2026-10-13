import { Body, Controller, Header, HttpCode, Post, Req, Res } from '@nestjs/common';
import {
  type CreateDeveloperRequest,
  CreateDeveloperRequestSchema,
  type MeResponse,
} from '@cv-rush/contracts';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../../../platform/http/app-error.js';
import { ZodValidationPipe } from '../../../platform/http/zod-validation.pipe.js';
import { DeviceCookies, IdentityService } from '../../identity/index.js';
import { OnboardDeveloper } from '../application/profile-use-cases.js';

@Controller('v1/developers')
export class DevelopersController {
  constructor(
    private readonly onboard: OnboardDeveloper,
    private readonly identity: IdentityService,
    private readonly cookies: DeviceCookies,
  ) {}

  /** Light onboarding: creates the provisional Developer and sets the device credential cookie. */
  @Post()
  @HttpCode(201)
  @Header('cache-control', 'no-store')
  async create(
    @Body(new ZodValidationPipe(CreateDeveloperRequestSchema)) body: CreateDeveloperRequest,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<MeResponse> {
    // One Developer per device: a recognised browser edits its profile instead.
    if (await this.identity.authenticate(this.cookies.read(request))) {
      throw new AppError('DEVELOPER_ALREADY_EXISTS', 409);
    }
    const { me, deviceToken } = await this.onboard.execute(body);
    this.cookies.write(reply, deviceToken);
    return me;
  }
}
