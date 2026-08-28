import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { hashPasscode } from '../domain/passcode';

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

	const slug = slugify(teamName);
	const existing = db.select().from(schema.teams).where(eq(schema.teams.slug, slug)).get();
	if (existing) {
		console.log(`Team "${teamName}" already exists (id: ${existing.id}) — skipping.`);
		return;
	}

	const passcodeHash = await hashPasscode(passcode);
	const team = { id: crypto.randomUUID(), name: teamName, slug, passcodeHash };
	db.insert(schema.teams).values(team).run();

	console.log(`Seeded team "${teamName}" (id: ${team.id}).`);
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
