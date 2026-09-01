import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';
import type { PollStatus } from '../db/schema';

type Db = BetterSQLite3Database<typeof schema>;

// Manual-only transitions for v1 (see plan). Written as a single function so
// a future scheduler driven by `opensAt`/`closesAt` can call the exact same
// guard instead of duplicating the valid-transition rules.
const VALID_TRANSITIONS: Record<PollStatus, PollStatus[]> = {
	upcoming: ['open'],
	open: ['closed'],
	closed: []
};

export class InvalidTransitionError extends Error {}

export function transition(db: Db, pollId: string, next: PollStatus): void {
	const poll = db.select().from(schema.polls).where(eq(schema.polls.id, pollId)).get();
	if (!poll) throw new Error(`Poll ${pollId} not found`);

	const allowed = VALID_TRANSITIONS[poll.status];
	if (!allowed.includes(next)) {
		throw new InvalidTransitionError(`Cannot transition poll from ${poll.status} to ${next}`);
	}

	db.update(schema.polls).set({ status: next }).where(eq(schema.polls.id, pollId)).run();
}
