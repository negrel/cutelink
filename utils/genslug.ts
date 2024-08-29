import { randomSequences, sequenceNumber } from "@/utils/random_sequence.ts";

function nthToString(
  length: number,
  n: bigint,
  charset: string | string[],
): string {
  const result = new Array(length).fill(charset[0]);

  const len = BigInt(charset.length);
  let i = 0;
  while (n > 0) {
    const index = n % len;
    n = n / len;
    result[i++] = charset[Number(index)];
  }

  return result.join("");
}

export function genslug(
  length: number,
  nth: bigint,
  charset: string | string[],
) {
  // Number of character in the charset.
  const base = BigInt(charset.length);
  // base ^ length = number of possible slug of length 'length' using charset.
  const max = base ** BigInt(length);
  const seq = randomSequences[max.toString()];
  if (!seq) throw new Error("unsupported slug length");
  if (nth > max) {
    throw new Error(`all links of length ${length} are used (${nth} > ${max})`);
  }

  return nthToString(length, sequenceNumber(seq, nth), charset);
}
