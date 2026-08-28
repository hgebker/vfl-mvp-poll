import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';

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
