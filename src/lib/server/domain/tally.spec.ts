import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { getResults, getTimeline, ResultsNotAvailableError } from './tally';
import { castVote } from './votes';
import { addToRoster, createTestDb, seedPlayer, seedSurvey, seedTeam } from './__test__/test-db';
import * as schema from '../db/schema';

describe('getResults', () => {
	it('given an open survey, when reading results, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'open' });

		expect(() => getResults(db, survey.id)).toThrow(ResultsNotAvailableError);
	});

	it('given a closed survey with votes, when reading results, then it returns per-player counts descending', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'open' });
		const playerA = seedPlayer(db, team.id, { firstName: 'A' });
		const playerB = seedPlayer(db, team.id, { firstName: 'B' });
		addToRoster(db, survey.id, playerA.id);
		addToRoster(db, survey.id, playerB.id);

		castVote(db, survey.id, 'token-1', [playerA.id, playerB.id]);
		castVote(db, survey.id, 'token-2', [playerA.id, playerB.id]);
		castVote(db, survey.id, 'token-3', [playerA.id, playerB.id]);

		db.update(schema.surveys)
			.set({ status: 'closed' })
			.where(eq(schema.surveys.id, survey.id))
			.run();

		const results = getResults(db, survey.id);
		expect(results[0]).toMatchObject({ playerId: playerA.id, votes: 3 });
		expect(results[1]).toMatchObject({ playerId: playerB.id, votes: 3 });
	});

	it('given a roster player with zero votes, when reading results, then they appear with a zero count', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'closed' });
		const bench = seedPlayer(db, team.id, { firstName: 'Bench' });
		addToRoster(db, survey.id, bench.id);

		const results = getResults(db, survey.id);
		expect(results).toEqual([expect.objectContaining({ playerId: bench.id, votes: 0 })]);
	});
});

describe('getTimeline', () => {
	it('given an open survey, when reading the timeline, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'open' });

		expect(() => getTimeline(db, survey.id)).toThrow(ResultsNotAvailableError);
	});
});
