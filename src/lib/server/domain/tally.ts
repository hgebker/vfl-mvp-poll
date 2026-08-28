import { and, desc, eq, sql } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

export class ResultsNotAvailableError extends Error {}

export interface PlayerTally {
	playerId: string;
	firstName: string;
	lastName: string;
	votes: number;
}

/** Per-player vote counts, descending. Guarded: only readable once closed. */
export function getResults(db: Db, surveyId: string): PlayerTally[] {
	assertClosed(db, surveyId);

	return db
		.select({
			playerId: schema.players.id,
			firstName: schema.players.firstName,
			lastName: schema.players.lastName,
			votes: sql<number>`count(${schema.votes.id})`.mapWith(Number)
		})
		.from(schema.surveyPlayers)
		.innerJoin(schema.players, eq(schema.players.id, schema.surveyPlayers.playerId))
		.leftJoin(
			schema.votes,
			and(
				eq(schema.votes.playerId, schema.surveyPlayers.playerId),
				eq(schema.votes.surveyId, surveyId)
			)
		)
		.where(eq(schema.surveyPlayers.surveyId, surveyId))
		.groupBy(schema.players.id)
		.orderBy(
			desc(sql`count(${schema.votes.id})`),
			schema.players.lastName,
			schema.players.firstName
		)
		.all();
}

export interface TimelineBucket {
	bucket: string; // ISO minute bucket, e.g. "2026-08-27T18:03"
	votes: number;
}

/** Vote-arrival timeline (per-minute buckets), for the activity chart. */
export function getTimeline(db: Db, surveyId: string): TimelineBucket[] {
	assertClosed(db, surveyId);

	return db
		.select({
			bucket: sql<string>`strftime('%Y-%m-%dT%H:%M', ${schema.votes.createdAt}, 'unixepoch')`,
			votes: sql<number>`count(*)`.mapWith(Number)
		})
		.from(schema.votes)
		.where(eq(schema.votes.surveyId, surveyId))
		.groupBy(sql`1`)
		.orderBy(sql`1`)
		.all();
}

function assertClosed(db: Db, surveyId: string): void {
	const survey = db.select().from(schema.surveys).where(eq(schema.surveys.id, surveyId)).get();
	if (!survey) throw new ResultsNotAvailableError('Survey not found');
	if (survey.status !== 'closed') {
		throw new ResultsNotAvailableError('Results are hidden until the survey is closed');
	}
}
