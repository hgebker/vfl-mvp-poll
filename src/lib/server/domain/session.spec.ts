import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { signSession, verifySession } from './session';

const SECRET = 'test-secret';

/** Builds a validly-signed cookie for an arbitrary (possibly invalid) payload, to test payload-shape validation independent of signature tampering. */
function signRawPayload(secret: string, payload: unknown): string {
	const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
	const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
	return `${encoded}.${signature}`;
}

describe('verifySession', () => {
	it('given a freshly signed session, when verifying it, then it returns the payload', () => {
		const cookie = signSession(SECRET, ['team-1'], 'team-1');

		expect(verifySession(SECRET, cookie)).toMatchObject({
			teamIds: ['team-1'],
			activeTeamId: 'team-1'
		});
	});

	it('given a session with multiple teams, when verifying it, then it returns all team ids and the active one', () => {
		const cookie = signSession(SECRET, ['team-1', 'team-2'], 'team-2');

		expect(verifySession(SECRET, cookie)).toMatchObject({
			teamIds: ['team-1', 'team-2'],
			activeTeamId: 'team-2'
		});
	});

	it('given a session signed with a different secret, when verifying it, then it is rejected', () => {
		const cookie = signSession('other-secret', ['team-1'], 'team-1');

		expect(verifySession(SECRET, cookie)).toBeNull();
	});

	it('given a tampered payload, when verifying it, then it is rejected', () => {
		const cookie = signSession(SECRET, ['team-1'], 'team-1');
		const [, signature] = cookie.split('.');
		const tampered = `${Buffer.from(
			JSON.stringify({ teamIds: ['team-2'], activeTeamId: 'team-2', expiresAt: Date.now() + 1000 })
		).toString('base64url')}.${signature}`;

		expect(verifySession(SECRET, tampered)).toBeNull();
	});

	it('given an activeTeamId not present in teamIds, when verifying it, then it is rejected', () => {
		const now = Date.now();
		const cookie = signRawPayload(SECRET, {
			teamIds: ['team-1'],
			activeTeamId: 'team-2',
			expiresAt: now + 1000
		});

		expect(verifySession(SECRET, cookie, now)).toBeNull();
	});

	it('given a session past its expiry, when verifying it, then it is rejected', () => {
		const now = Date.now();
		const cookie = signSession(SECRET, ['team-1'], 'team-1', now - 1000 * 60 * 60 * 25);

		expect(verifySession(SECRET, cookie, now)).toBeNull();
	});

	it('given a malformed cookie value, when verifying it, then it is rejected', () => {
		expect(verifySession(SECRET, 'not-a-valid-cookie')).toBeNull();
	});
});
