import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { createPlayer, deletePlayer, listPlayers, setPlayerActive, updatePlayer } from './players';
import { addToRoster, createTestDb, seedPlayer, seedSurvey, seedTeam } from './__test__/test-db';

describe('listPlayers', () => {
	it('given an inactive player, when listing active-only, then they are excluded', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const active = createPlayer(db, team.id, 'Active', 'Player', 1);
		const inactive = createPlayer(db, team.id, 'Inactive', 'Player', 2);
		setPlayerActive(db, team.id, inactive.id, false);

		const players = listPlayers(db, team.id, { activeOnly: true });

		expect(players.map((p) => p.id)).toEqual([active.id]);
	});

	it('given an inactive player, when listing all players, then they are still included', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const player = createPlayer(db, team.id, 'Bench', 'Warmer', 3);
		setPlayerActive(db, team.id, player.id, false);

		const players = listPlayers(db, team.id);

		expect(players.map((p) => p.id)).toContain(player.id);
	});
});

describe('updatePlayer', () => {
	it('given a player, when updated, then the name and jersey number change', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const player = seedPlayer(db, team.id, { firstName: 'Old', lastName: 'Name' });

		updatePlayer(db, team.id, player.id, 'New', 'Name', 42);

		const found = db.select().from(schema.players).where(eq(schema.players.id, player.id)).get();
		expect(found).toMatchObject({ firstName: 'New', lastName: 'Name', jerseyNumber: 42 });
	});

	it('given a jersey number already used by another player on the same team, when updating, then it throws', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const taken = seedPlayer(db, team.id, { jerseyNumber: 7 });
		const player = seedPlayer(db, team.id, { jerseyNumber: 8 });

		expect(() =>
			updatePlayer(db, team.id, player.id, 'New', 'Name', taken.jerseyNumber)
		).toThrow();
	});

	it('given a player belonging to another team, when updating with the wrong teamId, then the player is not changed', () => {
		const db = createTestDb();
		const teamA = seedTeam(db, { slug: 'team-a' });
		const teamB = seedTeam(db, { slug: 'team-b' });
		const player = seedPlayer(db, teamA.id, { firstName: 'Original' });

		updatePlayer(db, teamB.id, player.id, 'Hacked', 'Name', 99);

		const found = db.select().from(schema.players).where(eq(schema.players.id, player.id)).get();
		expect(found?.firstName).toBe('Original');
	});
});

describe('deletePlayer', () => {
	it('given a player, when deleted, then the player row is gone', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const player = seedPlayer(db, team.id);

		deletePlayer(db, team.id, player.id);

		const found = db.select().from(schema.players).where(eq(schema.players.id, player.id)).get();
		expect(found).toBeUndefined();
	});

	it('given a player on a survey roster with votes, when deleted, then the roster entry and votes are also removed', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const player = seedPlayer(db, team.id);
		const survey = seedSurvey(db, team.id);
		addToRoster(db, survey.id, player.id);
		db.insert(schema.votes)
			.values({ id: crypto.randomUUID(), surveyId: survey.id, playerId: player.id })
			.run();

		deletePlayer(db, team.id, player.id);

		const roster = db
			.select()
			.from(schema.surveyPlayers)
			.where(eq(schema.surveyPlayers.playerId, player.id))
			.all();
		const votes = db.select().from(schema.votes).where(eq(schema.votes.playerId, player.id)).all();
		expect(roster).toEqual([]);
		expect(votes).toEqual([]);
	});

	it('given a player belonging to another team, when deleting with the wrong teamId, then the player is not deleted', () => {
		const db = createTestDb();
		const teamA = seedTeam(db, { slug: 'team-a' });
		const teamB = seedTeam(db, { slug: 'team-b' });
		const player = seedPlayer(db, teamA.id);

		deletePlayer(db, teamB.id, player.id);

		const found = db.select().from(schema.players).where(eq(schema.players.id, player.id)).get();
		expect(found).toBeDefined();
	});
});
