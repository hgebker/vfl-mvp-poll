import { nanoid } from 'nanoid';
import { and, eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';
import type { HomeAway } from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

export interface CreatePollInput {
	opponent: string;
	matchDate: Date;
	homeAway: HomeAway;
	rosterPlayerIds: string[];
}

export function createPoll(db: Db, teamId: string, input: CreatePollInput) {
	if (input.rosterPlayerIds.length < 2) {
		throw new Error('A poll needs at least two roster players to vote for');
	}

	const poll = {
		id: crypto.randomUUID(),
		teamId,
		slug: nanoid(10),
		opponent: input.opponent.trim(),
		matchDate: input.matchDate,
		homeAway: input.homeAway,
		status: 'upcoming' as const
	};

	db.transaction((tx) => {
		tx.insert(schema.polls).values(poll).run();
		tx.insert(schema.pollPlayers)
			.values(input.rosterPlayerIds.map((playerId) => ({ pollId: poll.id, playerId })))
			.run();
	});

	return poll;
}

export function getPollBySlug(db: Db, slug: string) {
	return db.select().from(schema.polls).where(eq(schema.polls.slug, slug)).get();
}

export function getPollRoster(db: Db, pollId: string) {
	return db
		.select({
			id: schema.players.id,
			firstName: schema.players.firstName,
			lastName: schema.players.lastName,
			jerseyNumber: schema.players.jerseyNumber
		})
		.from(schema.pollPlayers)
		.innerJoin(schema.players, eq(schema.players.id, schema.pollPlayers.playerId))
		.where(eq(schema.pollPlayers.pollId, pollId))
		.orderBy(schema.players.lastName, schema.players.firstName)
		.all();
}

export function deletePoll(db: Db, teamId: string, pollId: string): void {
	db.delete(schema.polls)
		.where(and(eq(schema.polls.id, pollId), eq(schema.polls.teamId, teamId)))
		.run();
}

export function listPollsForTeam(db: Db, teamId: string) {
	return db
		.select()
		.from(schema.polls)
		.where(eq(schema.polls.teamId, teamId))
		.orderBy(schema.polls.matchDate)
		.all();
}

/** Auto-generated display title (see plan: structured metadata, generated title). */
export function pollTitle(poll: { opponent: string; homeAway: HomeAway; matchDate: Date }): string {
	const date = new Date(poll.matchDate).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
	const prefix = poll.homeAway === 'home' ? 'vs' : '@';
	return `${prefix} ${poll.opponent} — ${date}`;
}
