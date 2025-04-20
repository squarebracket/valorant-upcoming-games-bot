import { jest } from '@jest/globals';

class Emote {
  constructor(
    public name: string
  ) {}
  public toString(): string {
    return `<:${this.name}:>`;
  }
}

export const emotes = [
  new Emote('game_changers_na'),
  new Emote('game_changers_sea'),
  new Emote('game_changers_series_brazil'),
]