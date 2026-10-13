import { Body, Controller, Get, Header, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import {
  type AnswerRequest,
  AnswerRequestSchema,
  type AnswerResponse,
  type AtsResponse,
  type AtsSubmitRequest,
  AtsSubmitRequestSchema,
  type ChallengeStage,
  ChallengeStageSchema,
  type CreateGameSessionRequest,
  CreateGameSessionRequestSchema,
  type GameResultView,
  type RankedStatus,
  type SessionView,
} from '@cv-rush/contracts';
import { z } from 'zod';
import { ZodValidationPipe } from '../../../platform/http/zod-validation.pipe.js';
import { CurrentDeveloper, DeveloperAuthGuard } from '../../identity/index.js';
import { GameSessionsService } from '../application/game-sessions.service.js';

const Id = new ZodValidationPipe(z.uuid());

/**
 * Game sessions (docs/architecture/13 §2). Every route needs the device credential and only
 * reaches the authenticated Developer's own sessions; state changes also pass the CSRF check.
 */
@Controller('v1/game-sessions')
@UseGuards(DeveloperAuthGuard)
export class GameSessionsController {
  constructor(private readonly sessions: GameSessionsService) {}

  @Get('ranked-status')
  @Header('cache-control', 'no-store')
  rankedStatus(@CurrentDeveloper() developerId: string): Promise<RankedStatus> {
    return this.sessions.rankedStatus(developerId);
  }

  @Post()
  @HttpCode(201)
  @Header('cache-control', 'no-store')
  create(
    @CurrentDeveloper() developerId: string,
    @Body(new ZodValidationPipe(CreateGameSessionRequestSchema)) body: CreateGameSessionRequest,
  ): Promise<SessionView> {
    return this.sessions.create(developerId, body);
  }

  @Get(':id')
  @Header('cache-control', 'no-store')
  get(@CurrentDeveloper() developerId: string, @Param('id', Id) id: string): Promise<SessionView> {
    return this.sessions.get(developerId, id);
  }

  @Post(':id/apply')
  @HttpCode(200)
  @Header('cache-control', 'no-store')
  apply(
    @CurrentDeveloper() developerId: string,
    @Param('id', Id) id: string,
  ): Promise<SessionView> {
    return this.sessions.apply(developerId, id);
  }

  @Post(':id/challenges/:stage/start')
  @HttpCode(200)
  @Header('cache-control', 'no-store')
  start(
    @CurrentDeveloper() developerId: string,
    @Param('id', Id) id: string,
    @Param('stage', new ZodValidationPipe(ChallengeStageSchema)) stage: ChallengeStage,
  ): Promise<SessionView> {
    return this.sessions.startChallenge(developerId, id, stage);
  }

  @Post(':id/challenges/:challengeId/answer')
  @HttpCode(200)
  @Header('cache-control', 'no-store')
  answer(
    @CurrentDeveloper() developerId: string,
    @Param('id', Id) id: string,
    @Param('challengeId', Id) challengeId: string,
    @Body(new ZodValidationPipe(AnswerRequestSchema)) body: AnswerRequest,
  ): Promise<AnswerResponse> {
    return this.sessions.answer(developerId, id, challengeId, body);
  }

  @Post(':id/challenges/:challengeId/ats')
  @HttpCode(200)
  @Header('cache-control', 'no-store')
  ats(
    @CurrentDeveloper() developerId: string,
    @Param('id', Id) id: string,
    @Param('challengeId', Id) challengeId: string,
    @Body(new ZodValidationPipe(AtsSubmitRequestSchema)) body: AtsSubmitRequest,
  ): Promise<AtsResponse> {
    return this.sessions.submitAts(developerId, id, challengeId, body);
  }

  @Get(':id/result')
  @Header('cache-control', 'no-store')
  result(
    @CurrentDeveloper() developerId: string,
    @Param('id', Id) id: string,
  ): Promise<GameResultView> {
    return this.sessions.result(developerId, id);
  }
}
