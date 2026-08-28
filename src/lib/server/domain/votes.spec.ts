import { describe, expect, it } from 'vitest';
import { castVote, VoteRejectedError } from './votes';
import { addToRoster, createTestDb, seedPlayer, seedSurvey, seedTeam } from './__test__/test-db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

function setUpOpenSurvey() {
	const db = createTestDb();
	const team = seedTeam(db);
	const survey = seedSurvey(db, team.id, { status: 'open' });
	const playerA = seedPlayer(db, team.id, { firstName: 'A' });
	const playerB = seedPlayer(db, team.id, { firstName: 'B' });
	const playerC = seedPlayer(db, team.id, { firstName: 'C' });
	addToRoster(db, survey.id, playerA.id);
	addToRoster(db, survey.id, playerB.id);
	return { db, survey, playerA, playerB, playerC };
}

describe('castVote', () => {
	it('given an open survey and two roster players, when casting a vote, then it records two vote rows and a receipt', () => {
		const { db, survey, playerA, playerB } = setUpOpenSurvey();

		castVote(db, survey.id, 'token-1', [playerA.id, playerB.id]);

		const votes = db.select().from(schema.votes).where(eq(schema.votes.surveyId, survey.id)).all();
		const receipts = db
			.select()
			.from(schema.voteReceipts)
			.where(eq(schema.voteReceipts.surveyId, survey.id))
			.all();
		expect(votes).toHaveLength(2);
		expect(receipts).toHaveLength(1);
	});

	it('given a vote already cast with a token, when the same token votes again, then it is rejected', () => {
		const { db, survey, playerA, playerB } = setUpOpenSurvey();
		castVote(db, survey.id, 'token-1', [playerA.id, playerB.id]);

		expect(() => castVote(db, survey.id, 'token-1', [playerA.id, playerB.id])).toThrow(
			VoteRejectedError
		);
	});

	it('given a survey that is not open, when casting a vote, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'upcoming' });
		const playerA = seedPlayer(db, team.id);
		const playerB = seedPlayer(db, team.id);
		addToRoster(db, survey.id, playerA.id);
		addToRoster(db, survey.id, playerB.id);

		expect(() => castVote(db, survey.id, 'token-1', [playerA.id, playerB.id])).toThrow(
			VoteRejectedError
		);
	});

	it('given only one pick, when casting a vote, then it is rejected', () => {
		const { db, survey, playerA } = setUpOpenSurvey();

		expect(() => castVote(db, survey.id, 'token-1', [playerA.id])).toThrow(VoteRejectedError);
	});

	it('given three picks, when casting a vote, then it is rejected', () => {
		const { db, survey, playerA, playerB, playerC } = setUpOpenSurvey();

		expect(() => castVote(db, survey.id, 'token-1', [playerA.id, playerB.id, playerC.id])).toThrow(
			VoteRejectedError
		);
	});

	it('given a pick that is not on the survey roster, when casting a vote, then it is rejected', () => {
		const { db, survey, playerA, playerC } = setUpOpenSurvey();

		expect(() => castVote(db, survey.id, 'token-1', [playerA.id, playerC.id])).toThrow(
			VoteRejectedError
		);
	});
});
