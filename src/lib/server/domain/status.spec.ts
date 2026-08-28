import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { InvalidTransitionError, transition } from './status';
import { createTestDb, seedSurvey, seedTeam } from './__test__/test-db';
import * as schema from '../db/schema';

describe('transition', () => {
	it('given an upcoming survey, when transitioning to open, then the status is updated', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'upcoming' });

		transition(db, survey.id, 'open');

		const updated = db.select().from(schema.surveys).where(eq(schema.surveys.id, survey.id)).get();
		expect(updated?.status).toBe('open');
	});

	it('given an open survey, when transitioning to closed, then the status is updated', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'open' });

		transition(db, survey.id, 'closed');

		const updated = db.select().from(schema.surveys).where(eq(schema.surveys.id, survey.id)).get();
		expect(updated?.status).toBe('closed');
	});

	it('given an upcoming survey, when transitioning directly to closed, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'upcoming' });

		expect(() => transition(db, survey.id, 'closed')).toThrow(InvalidTransitionError);
	});

	it('given a closed survey, when transitioning to open, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const survey = seedSurvey(db, team.id, { status: 'closed' });

		expect(() => transition(db, survey.id, 'open')).toThrow(InvalidTransitionError);
	});
});
