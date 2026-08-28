import { describe, expect, it } from 'vitest';
import { createSurvey, getSurveyRoster, surveyTitle } from './surveys';
import { createTestDb, seedPlayer, seedTeam } from './__test__/test-db';

describe('createSurvey', () => {
	it('given two roster players, when creating a survey, then the roster is attached to it', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const a = seedPlayer(db, team.id, { firstName: 'A' });
		const b = seedPlayer(db, team.id, { firstName: 'B' });

		const survey = createSurvey(db, team.id, {
			opponent: 'Rivals FC',
			matchDate: new Date(),
			homeAway: 'home',
			rosterPlayerIds: [a.id, b.id]
		});

		const roster = getSurveyRoster(db, survey.id);
		expect(roster.map((p) => p.id).sort()).toEqual([a.id, b.id].sort());
		expect(survey.status).toBe('upcoming');
	});

	it('given fewer than two roster players, when creating a survey, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const a = seedPlayer(db, team.id);

		expect(() =>
			createSurvey(db, team.id, {
				opponent: 'Rivals FC',
				matchDate: new Date(),
				homeAway: 'home',
				rosterPlayerIds: [a.id]
			})
		).toThrow();
	});
});

describe('surveyTitle', () => {
	it('given a home match, when generating the title, then it is prefixed with "vs"', () => {
		const title = surveyTitle({
			opponent: 'Rivals FC',
			homeAway: 'home',
			matchDate: new Date('2026-08-24')
		});

		expect(title).toBe('vs Rivals FC — 24 Aug 2026');
	});

	it('given an away match, when generating the title, then it is prefixed with "@"', () => {
		const title = surveyTitle({
			opponent: 'Rivals FC',
			homeAway: 'away',
			matchDate: new Date('2026-08-24')
		});

		expect(title).toBe('@ Rivals FC — 24 Aug 2026');
	});
});
