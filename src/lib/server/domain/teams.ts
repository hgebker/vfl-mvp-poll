import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';
import { hashPasscode } from './passcode';

type Db = BetterSQLite3Database<typeof schema>;

/**
 * v1 is single-team (see plan: schema is multi-team-ready, but only one
 * team is ever seeded and there's no team-scoped routing yet). This is the
 * one seam that will need to change — into "resolve team by slug from the
 * URL" — when a second team is onboarded.
 */
export function getOnlyTeam(db: Db) {
	const team = db.select().from(schema.teams).get();
	if (!team) throw new Error('No team has been seeded — run `npm run db:seed`');
	return team;
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
