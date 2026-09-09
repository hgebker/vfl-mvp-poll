import { and, eq, inArray } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

export type VoteRejectedReason =
	| 'poll_not_found'
	| 'poll_not_open'
	| 'invalid_picks'
	| 'not_on_roster'
	| 'already_voted';

export class VoteRejectedError extends Error {
	constructor(public reason: VoteRejectedReason) {
		super(reason);
	}
}

/**
 * Casts a ballot: exactly two distinct picks from the poll's roster.
 *
 * Anonymity guarantee: this inserts a `voteReceipts` row (proves "token
 * voted") and two `votes` rows (the picks) in one transaction, but the
 * receipt never stores which players were picked and the votes never store
 * the token — the two tables can't be joined to deanonymize a ballot.
 *
 * One-shot/immutable: a token that already has a receipt for this poll
 * is rejected outright, there is no update path.
 */
export function castVote(db: Db, pollId: string, token: string, playerIds: string[]): void {
	const poll = db.select().from(schema.polls).where(eq(schema.polls.id, pollId)).get();
	if (!poll) throw new VoteRejectedError('poll_not_found');
	if (poll.status !== 'open') throw new VoteRejectedError('poll_not_open');

	const distinctPicks = new Set(playerIds);
	if (distinctPicks.size !== 2) {
		throw new VoteRejectedError('invalid_picks');
	}

	const roster = db
		.select({ playerId: schema.pollPlayers.playerId })
		.from(schema.pollPlayers)
		.where(
			and(
				eq(schema.pollPlayers.pollId, pollId),
				inArray(schema.pollPlayers.playerId, [...distinctPicks])
			)
		)
		.all();
	if (roster.length !== 2) {
		throw new VoteRejectedError('not_on_roster');
	}

	const existingReceipt = db
		.select()
		.from(schema.voteReceipts)
		.where(and(eq(schema.voteReceipts.pollId, pollId), eq(schema.voteReceipts.token, token)))
		.get();
	if (existingReceipt) {
		throw new VoteRejectedError('already_voted');
	}

	db.transaction((tx) => {
		tx.insert(schema.voteReceipts).values({ pollId, token }).run();
		tx.insert(schema.votes)
			.values([...distinctPicks].map((playerId) => ({ pollId, playerId })))
			.run();
	});
}
