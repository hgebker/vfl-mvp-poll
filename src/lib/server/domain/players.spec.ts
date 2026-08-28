import { describe, expect, it } from 'vitest';
import { createPlayer, listPlayers, setPlayerActive } from './players';
import { createTestDb, seedTeam } from './__test__/test-db';

describe('listPlayers', () => {
	it('given an inactive player, when listing active-only, then they are excluded', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const active = createPlayer(db, team.id, 'Active', 'Player');
		const inactive = createPlayer(db, team.id, 'Inactive', 'Player');
		setPlayerActive(db, team.id, inactive.id, false);

		const players = listPlayers(db, team.id, { activeOnly: true });

		expect(players.map((p) => p.id)).toEqual([active.id]);
	});

	it('given an inactive player, when listing all players, then they are still included', () => {
		const db = createTestDb();
		const team = seedTeam(db);
		const player = createPlayer(db, team.id, 'Bench', 'Warmer');
		setPlayerActive(db, team.id, player.id, false);

		const players = listPlayers(db, team.id);

		expect(players.map((p) => p.id)).toContain(player.id);
	});
});
