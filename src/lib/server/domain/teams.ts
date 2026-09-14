import { eq } from 'drizzle-orm';
import { verify } from '@node-rs/argon2';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';
import { hashPasscode } from './passcode';

type Db = BetterSQLite3Database<typeof schema>;

/** Finds the team whose stored passcode hash matches the given plaintext passcode, or null. */
export async function findTeamByPasscode(db: Db, passcode: string) {
	const allTeams = db.select().from(schema.teams).all();
	for (const team of allTeams) {
		if (await verify(team.passcodeHash, passcode)) return team;
	}
	return null;
}

export function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

/** Idempotent: returns the existing team if one with the same slug already exists. */
export async function createTeam(db: Db, name: string, passcode: string) {
	const slug = slugify(name);
	const existing = db.select().from(schema.teams).where(eq(schema.teams.slug, slug)).get();
	if (existing) return existing;

	const passcodeHash = await hashPasscode(passcode);
	const team = { id: crypto.randomUUID(), name, slug, passcodeHash };
	db.insert(schema.teams).values(team).run();
	return team;
}
