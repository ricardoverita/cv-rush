import { Injectable } from '@nestjs/common';

/** The server's clock. Only server time counts; tests can replace it to travel in time. */
@Injectable()
export class Clock {
  now(): Date {
    return new Date();
  }
}
