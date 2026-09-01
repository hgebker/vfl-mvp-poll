import { and, desc, eq, sql } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

export class ResultsNotAvailableError extends Error {}

export interface PlayerTally {
	playerId: string;
	firstName: string;
	lastName: string;
	jerseyNumber: number;
	votes: number;
}

/** Per-player vote counts, descending. Guarded: only readable once closed. */
export function getResults(db: Db, pollId: string): PlayerTally[] {
	assertClosed(db, pollId);

	return db
		.select({
			playerId: schema.players.id,
			firstName: schema.players.firstName,
			lastName: schema.players.lastName,
			jerseyNumber: schema.players.jerseyNumber,
			votes: sql<number>`count(${schema.votes.id})`.mapWith(Number)
		})
		.from(schema.pollPlayers)
		.innerJoin(schema.players, eq(schema.players.id, schema.pollPlayers.playerId))
		.leftJoin(
			schema.votes,
			and(eq(schema.votes.playerId, schema.pollPlayers.playerId), eq(schema.votes.pollId, pollId))
		)
		.where(eq(schema.pollPlayers.pollId, pollId))
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
export function getTimeline(db: Db, pollId: string): TimelineBucket[] {
	assertClosed(db, pollId);

	return db
		.select({
			bucket: sql<string>`strftime('%Y-%m-%dT%H:%M', ${schema.votes.createdAt}, 'unixepoch')`,
			votes: sql<number>`count(*)`.mapWith(Number)
		})
		.from(schema.votes)
		.where(eq(schema.votes.pollId, pollId))
		.groupBy(sql`1`)
		.orderBy(sql`1`)
		.all();
}

function assertClosed(db: Db, pollId: string): void {
	const poll = db.select().from(schema.polls).where(eq(schema.polls.id, pollId)).get();
	if (!poll) throw new ResultsNotAvailableError('Poll not found');
	if (poll.status !== 'closed') {
		throw new ResultsNotAvailableError('Results are hidden until the poll is closed');
	}
}
