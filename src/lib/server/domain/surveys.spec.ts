import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { createSurvey, deleteSurvey, getSurveyRoster, surveyTitle } from './surveys';
import { addToRoster, createTestDb, seedPlayer, seedSurvey, seedTeam } from './__test__/test-db';

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

describe('deleteSurvey', () => {
	it('given a survey, when deleted, then the survey row is gone', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id);

		deleteSurvey(db, team.id, survey.id);

		const found = db.select().from(schema.surveys).where(eq(schema.surveys.id, survey.id)).get();
		expect(found).toBeUndefined();
	});

	it('given a survey with roster players and votes, when deleted, then the roster and votes are also removed', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id);
		const player = seedPlayer(db, team.id);
		addToRoster(db, survey.id, player.id);
		db.insert(schema.votes)
			.values({ id: crypto.randomUUID(), surveyId: survey.id, playerId: player.id })
			.run();

		deleteSurvey(db, team.id, survey.id);

		const roster = db
			.select()
			.from(schema.surveyPlayers)
			.where(eq(schema.surveyPlayers.surveyId, survey.id))
			.all();
		const votes = db.select().from(schema.votes).where(eq(schema.votes.surveyId, survey.id)).all();
		expect(roster).toEqual([]);
		expect(votes).toEqual([]);
	});

	it('given a survey belonging to another team, when deleting with the wrong teamId, then the survey is not deleted', () => {
		const db = createTestDb();
		const teamA = seedTeam(db, { slug: 'team-a' });
		const teamB = seedTeam(db, { slug: 'team-b' });
		const survey = seedSurvey(db, teamA.id);

		deleteSurvey(db, teamB.id, survey.id);

		const found = db.select().from(schema.surveys).where(eq(schema.surveys.id, survey.id)).get();
		expect(found).toBeDefined();
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
