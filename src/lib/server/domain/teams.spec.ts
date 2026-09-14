import { describe, expect, it } from 'vitest';
import { createTeam, findTeamByPasscode, getTeamsByIds } from './teams';
import { createTestDb } from './__test__/test-db';

describe('createTeam', () => {
	it('given a new team name, when creating it, then it is persisted with a slugified slug', async () => {
		const db = createTestDb();

		const team = await createTeam(db, 'My New Team', 'let-me-in');

		expect(team.slug).toBe('my-new-team');
	});

	it('given a team whose slug already exists, when creating again, then the existing team is returned unchanged', async () => {
		const db = createTestDb();
		const first = await createTeam(db, 'My Team', 'first-pass');

		const second = await createTeam(db, 'My Team', 'different-pass');

		expect(second.id).toBe(first.id);
		expect(second.passcodeHash).toBe(first.passcodeHash);
	});
});

describe('findTeamByPasscode', () => {
	it("given multiple teams, when finding by one team's passcode, then that team is returned", async () => {
		const db = createTestDb();
		await createTeam(db, 'Team A', 'passcode-a');
		const teamB = await createTeam(db, 'Team B', 'passcode-b');

		const found = await findTeamByPasscode(db, 'passcode-b');

		expect(found?.id).toBe(teamB.id);
	});

	it('given no team has a matching passcode, when finding by passcode, then null is returned', async () => {
		const db = createTestDb();
		await createTeam(db, 'Team A', 'passcode-a');

		const found = await findTeamByPasscode(db, 'wrong-passcode');

		expect(found).toBeNull();
	});
});

describe('getTeamsByIds', () => {
	it('given a list of team ids, when fetching them, then only the matching teams are returned', async () => {
		const db = createTestDb();
		const teamA = await createTeam(db, 'Team A', 'passcode-a');
		await createTeam(db, 'Team B', 'passcode-b');
		const teamC = await createTeam(db, 'Team C', 'passcode-c');

		const found = await getTeamsByIds(db, [teamA.id, teamC.id]);

		expect(found.map((team) => team.id).sort()).toEqual([teamA.id, teamC.id].sort());
	});

	it('given an empty list of ids, when fetching teams, then an empty array is returned', () => {
		const db = createTestDb();

		expect(getTeamsByIds(db, [])).toEqual([]);
	});
});
