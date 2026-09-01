import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { InvalidTransitionError, transition } from './status';
import { createTestDb, seedPoll, seedTeam } from './__test__/test-db';
import * as schema from '../db/schema';

describe('transition', () => {
	it('given an upcoming poll, when transitioning to open, then the status is updated', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'upcoming' });

		transition(db, poll.id, 'open');

		const updated = db.select().from(schema.polls).where(eq(schema.polls.id, poll.id)).get();
		expect(updated?.status).toBe('open');
	});

	it('given an open poll, when transitioning to closed, then the status is updated', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'open' });

		transition(db, poll.id, 'closed');

		const updated = db.select().from(schema.polls).where(eq(schema.polls.id, poll.id)).get();
		expect(updated?.status).toBe('closed');
	});

	it('given an upcoming poll, when transitioning directly to closed, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'upcoming' });

		expect(() => transition(db, poll.id, 'closed')).toThrow(InvalidTransitionError);
	});

	it('given a closed poll, when transitioning to open, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id, { status: 'closed' });

		expect(() => transition(db, poll.id, 'open')).toThrow(InvalidTransitionError);
	});
});
