import { describe, expect, it } from 'vitest';
import { createTeam } from './teams';
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
