import { Injectable } from '@nestjs/common';
import { readRuleset, type Ruleset } from '@cv-rush/content';

/** The ruleset new sessions use. Older sessions keep evaluating with the version they recorded. */
export const CURRENT_RULESET = 'ruleset-v0';

@Injectable()
export class Rulesets {
  private readonly cache = new Map<string, Ruleset>();

  constructor() {
    this.get(CURRENT_RULESET);
  }

  current(): Ruleset {
    return this.get(CURRENT_RULESET);
  }

  get(version: string): Ruleset {
    let ruleset = this.cache.get(version);
    if (!ruleset) {
      ruleset = readRuleset(version);
      this.cache.set(version, ruleset);
    }
    return ruleset;
  }
}
