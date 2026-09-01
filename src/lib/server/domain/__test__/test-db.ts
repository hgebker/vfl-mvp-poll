import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../../db/schema';

/**
 * Builds a fresh in-memory SQLite DB with the real migrations applied, so
 * domain-logic unit tests exercise actual SQL (constraints, transactions)
 * rather than a mocked query builder.
 */
export function createTestDb() {
	const client = new Database(':memory:');
	client.pragma('foreign_keys = ON');
	const db = drizzle(client, { schema });
	migrate(db, { migrationsFolder: 'drizzle' });
	return db;
}

export function seedTeam(
	db: ReturnType<typeof createTestDb>,
	overrides: Partial<typeof schema.teams.$inferInsert> = {}
) {
	const team = {
		id: crypto.randomUUID(),
		name: 'Test Team',
		slug: 'test-team',
		passcodeHash: 'unused-in-domain-tests',
		...overrides
	};
	db.insert(schema.teams).values(team).run();
	return team;
}

export function seedPlayer(
	db: ReturnType<typeof createTestDb>,
	teamId: string,
	overrides: Partial<typeof schema.players.$inferInsert> = {}
) {
	const player = {
		id: crypto.randomUUID(),
		teamId,
		firstName: 'First',
		lastName: 'Last',
		...overrides
	};
	db.insert(schema.players).values(player).run();
	return player;
}

export function seedSurvey(
	db: ReturnType<typeof createTestDb>,
	teamId: string,
	overrides: Partial<typeof schema.surveys.$inferInsert> = {}
) {
	const survey = {
		id: crypto.randomUUID(),
		teamId,
		slug: crypto.randomUUID(),
		opponent: 'Rivals FC',
		matchDate: new Date(),
		homeAway: 'home' as const,
		status: 'upcoming' as const,
		...overrides
	};
	db.insert(schema.surveys).values(survey).run();
	return survey;
}

export function addToRoster(
	db: ReturnType<typeof createTestDb>,
	surveyId: string,
	playerId: string
) {
	db.insert(schema.surveyPlayers).values({ surveyId, playerId }).run();
}
