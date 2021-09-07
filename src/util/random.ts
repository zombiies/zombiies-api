import * as seedrandom from 'seedrandom';

interface prng {
  (): number;
  double(): number;
  int32(): number;
  quick(): number;
  state(): seedrandom.State;
}

export const createRng = (seed: string): prng => seedrandom(seed);
export const nextInt = (rng: prng, max: number) => Math.floor(rng() * max);
