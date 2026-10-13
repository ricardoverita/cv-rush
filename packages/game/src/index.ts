/**
 * Contracts between the game engine and its host (the web app).
 *
 * The engine (Phaser, slice S3) will implement `createGame`. It never performs network I/O
 * itself (everything goes through `GameServerPort`), never imports React or Next.js, never
 * holds answer keys and never computes scores: it renders outcomes decided by the server.
 * See docs/architecture/14-game-client-integration.md.
 */
import type { Locale } from '@cv-rush/contracts';

export type Translator = (key: string, params?: Record<string, string | number>) => string;

export interface GameSettings {
  reducedMotion: boolean;
  muted: boolean;
  relaxedTimers: boolean;
}

/** Network port implemented by the host (web app) and injected into the engine. */
export interface GameServerPort {
  reachCheckpoint(stage: string, clientEvents: readonly unknown[]): Promise<unknown>;
  answer(challengeId: string, questionAttemptId: string, optionId: string): Promise<unknown>;
  completeAts(challengeId: string, inputLog: readonly unknown[]): Promise<unknown>;
}

export interface CreateGameOptions {
  server: GameServerPort;
  t: Translator;
  locale: Locale;
  settings: GameSettings;
  assetsBaseUrl: string;
}

export type GameEventName =
  | 'ready'
  | 'stageChanged'
  | 'questionShown'
  | 'answerSubmitted'
  | 'effectApplied'
  | 'failed'
  | 'delivered'
  | 'networkError'
  | 'fpsDegraded';

export interface GameHandle {
  start(session: unknown): void;
  resume(state: unknown): void;
  setSettings(settings: Partial<GameSettings>): void;
  pause(): void;
  destroy(): void;
  on(event: GameEventName, callback: (payload: unknown) => void): () => void;
}

export type CreateGame = (container: HTMLElement, options: CreateGameOptions) => GameHandle;
