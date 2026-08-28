import { and, eq, inArray } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

export class VoteRejectedError extends Error {}

/**
 * Casts a ballot: exactly two distinct picks from the survey's roster.
 *
 * Anonymity guarantee: this inserts a `voteReceipts` row (proves "token
 * voted") and two `votes` rows (the picks) in one transaction, but the
 * receipt never stores which players were picked and the votes never store
 * the token — the two tables can't be joined to deanonymize a ballot.
 *
 * One-shot/immutable: a token that already has a receipt for this survey
 * is rejected outright, there is no update path.
 */
export function castVote(db: Db, surveyId: string, token: string, playerIds: string[]): void {
	const survey = db.select().from(schema.surveys).where(eq(schema.surveys.id, surveyId)).get();
	if (!survey) throw new VoteRejectedError('Survey not found');
	if (survey.status !== 'open') throw new VoteRejectedError('Survey is not open for voting');

	const distinctPicks = new Set(playerIds);
	if (distinctPicks.size !== 2) {
		throw new VoteRejectedError('A ballot must contain exactly two distinct picks');
	}

	const roster = db
		.select({ playerId: schema.surveyPlayers.playerId })
		.from(schema.surveyPlayers)
		.where(
			and(
				eq(schema.surveyPlayers.surveyId, surveyId),
				inArray(schema.surveyPlayers.playerId, [...distinctPicks])
			)
		)
		.all();
	if (roster.length !== 2) {
		throw new VoteRejectedError('Both picks must be on the survey roster');
	}

	const existingReceipt = db
		.select()
		.from(schema.voteReceipts)
		.where(and(eq(schema.voteReceipts.surveyId, surveyId), eq(schema.voteReceipts.token, token)))
		.get();
	if (existingReceipt) {
		throw new VoteRejectedError('This browser has already voted in this survey');
	}

	db.transaction((tx) => {
		tx.insert(schema.voteReceipts).values({ surveyId, token }).run();
		tx.insert(schema.votes)
			.values([...distinctPicks].map((playerId) => ({ surveyId, playerId })))
			.run();
	});
}
