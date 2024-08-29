export type Result<T, E> = { ok: T; err?: null } | { ok?: null; err: E };
