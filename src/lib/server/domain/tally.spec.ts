import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { getResults, getTimeline, ResultsNotAvailableError } from './tally';
import { castVote } from './votes';
import { addToRoster, createTestDb, seedPlayer, seedPoll, seedTeam } from './__test__/test-db';
import * as schema from '../db/schema';

describe('getResults', () => {
	it('given an open poll, when reading results, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'open' });

		expect(() => getResults(db, poll.id)).toThrow(ResultsNotAvailableError);
	});

	it('given a closed poll with votes, when reading results, then it returns per-player counts descending', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'open' });
		const playerA = seedPlayer(db, team.id, { firstName: 'A' });
		const playerB = seedPlayer(db, team.id, { firstName: 'B' });
		addToRoster(db, poll.id, playerA.id);
		addToRoster(db, poll.id, playerB.id);

		castVote(db, poll.id, 'token-1', [playerA.id, playerB.id]);
		castVote(db, poll.id, 'token-2', [playerA.id, playerB.id]);
		castVote(db, poll.id, 'token-3', [playerA.id, playerB.id]);

		db.update(schema.polls).set({ status: 'closed' }).where(eq(schema.polls.id, poll.id)).run();

		const results = getResults(db, poll.id);
		expect(results[0]).toMatchObject({ playerId: playerA.id, votes: 3 });
		expect(results[1]).toMatchObject({ playerId: playerB.id, votes: 3 });
	});

	it('given a roster player with zero votes, when reading results, then they appear with a zero count', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'closed' });
		const bench = seedPlayer(db, team.id, { firstName: 'Bench' });
		addToRoster(db, poll.id, bench.id);

		const results = getResults(db, poll.id);
		expect(results).toEqual([expect.objectContaining({ playerId: bench.id, votes: 0 })]);
	});
});

describe('getTimeline', () => {
	it('given an open poll, when reading the timeline, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'open' });

		expect(() => getTimeline(db, poll.id)).toThrow(ResultsNotAvailableError);
	});
});
