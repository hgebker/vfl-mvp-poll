import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { createTeam } from '../domain/teams';

/**
 * Seeds the single team this v1 deployment runs for (see plan: schema is
 * multi-team-ready, but only one team is ever created for now).
 *
 * Usage: TEAM_NAME="..." TEAM_PASSCODE="..." npm run db:seed
 */
async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error('DATABASE_URL is not set');

	const teamName = process.env.TEAM_NAME ?? 'My Team';
	const passcode = process.env.TEAM_PASSCODE;
	if (!passcode)
		throw new Error('Set TEAM_PASSCODE to the passcode team members will use to sign in');

	const client = new Database(databaseUrl);
	const db = drizzle(client, { schema });

	const team = await createTeam(db, teamName, passcode);

	console.log(`Seeded team "${team.name}" (id: ${team.id}).`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
