import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';
import type { SurveyStatus } from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

// Manual-only transitions for v1 (see plan). Written as a single function so
// a future scheduler driven by `opensAt`/`closesAt` can call the exact same
// guard instead of duplicating the valid-transition rules.
const VALID_TRANSITIONS: Record<SurveyStatus, SurveyStatus[]> = {
	upcoming: ['open'],
	open: ['closed'],
	closed: []
};

export class InvalidTransitionError extends Error {}

export function transition(db: Db, surveyId: string, next: SurveyStatus): void {
	const survey = db.select().from(schema.surveys).where(eq(schema.surveys.id, surveyId)).get();
	if (!survey) throw new Error(`Survey ${surveyId} not found`);

	const allowed = VALID_TRANSITIONS[survey.status];
	if (!allowed.includes(next)) {
		throw new InvalidTransitionError(`Cannot transition survey from ${survey.status} to ${next}`);
	}

	db.update(schema.surveys).set({ status: next }).where(eq(schema.surveys.id, surveyId)).run();
}
