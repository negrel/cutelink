import * as charsets from "@/utils/charset.ts";
import { RandomSequence } from "@/utils/random_sequence.ts";

function gcd(a: bigint, b: bigint) {
  // Ensure inputs are BigInt
  a = BigInt(a);
  b = BigInt(b);

  // Ensure a and b are non-negative
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;

  // Euclidean algorithm
  while (b !== 0n) {
    const temp = b;
    b = a % b;
    a = temp;
  }

  return a;
}

function coprime(a: bigint, b: bigint): boolean {
  return gcd(a, b) === 1n;
}

function findCoprimeResevoir(min: bigint, target: bigint): bigint {
  // Max number of coprime we can found.
  const MAX_COUNT = 100_000;
  // Number of coprime found.
  let count = 0;

  let result = 0n;
  for (let i = min; i < target; i++) {
    if (coprime(i, target)) {
      count++;

      // If first coprime or random is 1/count, select this coprime.
      if (count === 1 || Math.floor(Math.random() * count) === 0) {
        result = i;
      }

      // We've found MAX_COUNT coprime, return selected one.
      if (count >= MAX_COUNT) return result;
    }
  }

  // unreachable
  return result;
}

function genRandomSequence(range: bigint): RandomSequence {
  return {
    n: range,
    a: findCoprimeResevoir(range / 2n, range),
    b: BigInt(Math.round(Math.random() * Number(range))),
  };
}

const randomSequences: Record<string, RandomSequence> = {};

for (const charset of Object.values(charsets)) {
  for (let i = 1n; i < 8; i++) {
    const possibilities = BigInt(charset.length) ** i;
    if (randomSequences[possibilities.toString()]) continue;

    randomSequences[possibilities.toString()] = genRandomSequence(
      possibilities,
    );
  }
}

console.log(JSON.stringify(randomSequences, (_k, v) => {
  if (typeof v === "bigint") return v.toString();
  return v;
}));
