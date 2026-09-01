import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { createPoll, deletePoll, getPollRoster, pollTitle } from './polls';
import { addToRoster, createTestDb, seedPlayer, seedPoll, seedTeam } from './__test__/test-db';

describe('createPoll', () => {
	it('given two roster players, when creating a poll, then the roster is attached to it', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const a = seedPlayer(db, team.id, { firstName: 'A' });
		const b = seedPlayer(db, team.id, { firstName: 'B' });

		const poll = createPoll(db, team.id, {
			opponent: 'Rivals FC',
			matchDate: new Date(),
			homeAway: 'home',
			rosterPlayerIds: [a.id, b.id]
		});

		const roster = getPollRoster(db, poll.id);
		expect(roster.map((p) => p.id).sort()).toEqual([a.id, b.id].sort());
		expect(poll.status).toBe('upcoming');
	});

	it('given fewer than two roster players, when creating a poll, then it is rejected', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const a = seedPlayer(db, team.id);

		expect(() =>
			createPoll(db, team.id, {
				opponent: 'Rivals FC',
				matchDate: new Date(),
				homeAway: 'home',
				rosterPlayerIds: [a.id]
			})
		).toThrow();
	});
});

describe('deletePoll', () => {
	it('given a poll, when deleted, then the poll row is gone', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id);

		deletePoll(db, team.id, poll.id);

		const found = db.select().from(schema.polls).where(eq(schema.polls.id, poll.id)).get();
		expect(found).toBeUndefined();
	});

	it('given a poll with roster players and votes, when deleted, then the roster and votes are also removed', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const poll = seedPoll(db, team.id);
		const player = seedPlayer(db, team.id);
		addToRoster(db, poll.id, player.id);
		db.insert(schema.votes)
			.values({ id: crypto.randomUUID(), pollId: poll.id, playerId: player.id })
			.run();

		deletePoll(db, team.id, poll.id);

		const roster = db
			.select()
			.from(schema.pollPlayers)
			.where(eq(schema.pollPlayers.pollId, poll.id))
			.all();
		const votes = db.select().from(schema.votes).where(eq(schema.votes.pollId, poll.id)).all();
		expect(roster).toEqual([]);
		expect(votes).toEqual([]);
	});

	it('given a poll belonging to another team, when deleting with the wrong teamId, then the poll is not deleted', () => {
		const db = createTestDb();
		const teamA = seedTeam(db, { slug: 'team-a' });
		const teamB = seedTeam(db, { slug: 'team-b' });
		const poll = seedPoll(db, teamA.id);

		deletePoll(db, teamB.id, poll.id);

		const found = db.select().from(schema.polls).where(eq(schema.polls.id, poll.id)).get();
		expect(found).toBeDefined();
	});
});

describe('pollTitle', () => {
	it('given a home match, when generating the title, then it is prefixed with "vs"', () => {
		const title = pollTitle({
			opponent: 'Rivals FC',
			homeAway: 'home',
			matchDate: new Date('2026-08-24')
		});

		expect(title).toBe('vs Rivals FC — 24 Aug 2026');
	});

	it('given an away match, when generating the title, then it is prefixed with "@"', () => {
		const title = pollTitle({
			opponent: 'Rivals FC',
			homeAway: 'away',
			matchDate: new Date('2026-08-24')
		});

		expect(title).toBe('@ Rivals FC — 24 Aug 2026');
	});
});
