import { describe, expect, it } from 'vitest';
import { castVote, VoteRejectedError } from './votes';
import { addToRoster, createTestDb, seedPlayer, seedPoll, seedTeam } from './__test__/test-db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

function setUpOpenPoll() {
	const db = createTestDb();
	const team = seedTeam(db);
	const poll = seedPoll(db, team.id, { status: 'open' });
	const playerA = seedPlayer(db, team.id, { firstName: 'A' });
	const playerB = seedPlayer(db, team.id, { firstName: 'B' });
	const playerC = seedPlayer(db, team.id, { firstName: 'C' });
	addToRoster(db, poll.id, playerA.id);
	addToRoster(db, poll.id, playerB.id);
	return { db, poll, playerA, playerB, playerC };
}

describe('castVote', () => {
	it('given an open poll and two roster players, when casting a vote, then it records two vote rows and a receipt', () => {
		const { db, poll, playerA, playerB } = setUpOpenPoll();

		castVote(db, poll.id, 'token-1', [playerA.id, playerB.id]);

		const votes = db.select().from(schema.votes).where(eq(schema.votes.pollId, poll.id)).all();
		const receipts = db
			.select()
			.from(schema.voteReceipts)
			.where(eq(schema.voteReceipts.pollId, poll.id))
			.all();
		expect(votes).toHaveLength(2);
		expect(receipts).toHaveLength(1);
	});

	it('given a vote already cast with a token, when the same token votes again, then it is rejected', () => {
		const { db, poll, playerA, playerB } = setUpOpenPoll();
		castVote(db, poll.id, 'token-1', [playerA.id, playerB.id]);

		expect(() => castVote(db, poll.id, 'token-1', [playerA.id, playerB.id])).toThrow(
			VoteRejectedError
		);
	});

	it('given a poll that is not open, when casting a vote, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'upcoming' });
		const playerA = seedPlayer(db, team.id);
		const playerB = seedPlayer(db, team.id);
		addToRoster(db, poll.id, playerA.id);
		addToRoster(db, poll.id, playerB.id);

		expect(() => castVote(db, poll.id, 'token-1', [playerA.id, playerB.id])).toThrow(
			VoteRejectedError
		);
	});

	it('given only one pick, when casting a vote, then it is rejected', () => {
		const { db, poll, playerA } = setUpOpenPoll();

		expect(() => castVote(db, poll.id, 'token-1', [playerA.id])).toThrow(VoteRejectedError);
	});

	it('given three picks, when casting a vote, then it is rejected', () => {
		const { db, poll, playerA, playerB, playerC } = setUpOpenPoll();

		expect(() => castVote(db, poll.id, 'token-1', [playerA.id, playerB.id, playerC.id])).toThrow(
			VoteRejectedError
		);
	});

	it('given a pick that is not on the poll roster, when casting a vote, then it is rejected', () => {
		const { db, poll, playerA, playerC } = setUpOpenPoll();

		expect(() => castVote(db, poll.id, 'token-1', [playerA.id, playerC.id])).toThrow(
			VoteRejectedError
		);
	});
});
