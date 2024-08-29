import jsonRandomSequence from "@/utils/random_sequences.json" with {
  type: "json",
};

/**
 * Random number sequence that iterates through [0, n) in a pseudo random way.
 * Inspired by https://lemire.me/blog/2017/09/18/visiting-all-values-in-an-array-exactly-once-in-random-order/
 */
export type RandomSequence = {
  n: bigint;
  // coprime with n
  a: bigint;
  b: bigint;
};

export function sequenceNumber(seq: RandomSequence, nth: bigint): bigint {
  return (nth * seq.a + seq.b) % seq.n;
}

export const randomSequences: Record<string, RandomSequence> = {};

for (const [possibilites, jsonLcg] of Object.entries(jsonRandomSequence)) {
  randomSequences[possibilites] = Object.fromEntries(
    Object.entries(jsonLcg).map(([k, v]) => [k, BigInt(v)]),
  ) as RandomSequence;
}
