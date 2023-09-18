function reverseBits (number: number): number {
  let result = 0
  for (let i = 0; i < 32; i++) {
    result <<= 1
    result |= number & 1
    number >>= 1
  }
  return result >>> 0
}

/**
 * Generates a random link (path only) with the given length and charset.
 */
export default function (length: number, seed: number, charset: string | string[]): string {
  const base = charset.length

  // Upper bound of seed
  const maxSeed = base ** length
  if (!Number.isSafeInteger(maxSeed)) {
    throw new Error('invalid link length')
  }

  if (seed > maxSeed) {
    throw new Error(`all links of size ${length} are used`)
  }

  // Initialize shortened URL with charset 0.
  const shortenedUrl = new Array(length).fill(charset[0])
  let n = reverseBits(seed)
  let i = 0
  do {
    const index = n % base
    shortenedUrl[i] = charset[index]
    n = Math.floor(n / base)
    i++
  } while (n > 0)

  return shortenedUrl.join('')
}
