import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

export async function hashPasscode(plaintext: string): Promise<string> {
	return hash(plaintext);
}

/**
 * Verifies a plaintext passcode against the hash stored for a team.
 * Returns false (rather than throwing) for an unknown team, so callers
 * can't distinguish "wrong team" from "wrong passcode".
 */
export async function verifyPasscode(db: Db, teamId: string, plaintext: string): Promise<boolean> {
	const team = db.select().from(schema.teams).where(eq(schema.teams.id, teamId)).get();
	if (!team) return false;
	return verify(team.passcodeHash, plaintext);
}
