import { describe, expect, it } from 'vitest';
import { hashPasscode, verifyPasscode } from './passcode';
import { createTestDb, seedTeam } from './__test__/test-db';

describe('verifyPasscode', () => {
	it('given a team with a hashed passcode, when verifying the correct plaintext, then it succeeds', async () => {
		const db = createTestDb();
		const team = seedTeam(db, { passcodeHash: await hashPasscode('let-me-in') });

		await expect(verifyPasscode(db, team.id, 'let-me-in')).resolves.toBe(true);
	});

	it('given a team with a hashed passcode, when verifying the wrong plaintext, then it fails', async () => {
		const db = createTestDb();
		const team = seedTeam(db, { passcodeHash: await hashPasscode('let-me-in') });

		await expect(verifyPasscode(db, team.id, 'wrong')).resolves.toBe(false);
	});

	it('given an unknown team id, when verifying any passcode, then it fails', async () => {
		const db = createTestDb();

		await expect(verifyPasscode(db, 'does-not-exist', 'anything')).resolves.toBe(false);
	});
});
