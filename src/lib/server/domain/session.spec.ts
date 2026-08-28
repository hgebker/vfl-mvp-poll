import { describe, expect, it } from 'vitest';
import { signSession, verifySession } from './session';

const SECRET = 'test-secret';

describe('verifySession', () => {
	it('given a freshly signed session, when verifying it, then it returns the team id', () => {
		const cookie = signSession(SECRET, 'team-1');

		expect(verifySession(SECRET, cookie)).toBe('team-1');
	});

	it('given a session signed with a different secret, when verifying it, then it is rejected', () => {
		const cookie = signSession('other-secret', 'team-1');

		expect(verifySession(SECRET, cookie)).toBeNull();
	});

	it('given a tampered payload, when verifying it, then it is rejected', () => {
		const cookie = signSession(SECRET, 'team-1');
		const [, signature] = cookie.split('.');
		const tampered = `${Buffer.from(JSON.stringify({ teamId: 'team-2', expiresAt: Date.now() + 1000 })).toString('base64url')}.${signature}`;

		expect(verifySession(SECRET, tampered)).toBeNull();
	});

	it('given a session past its expiry, when verifying it, then it is rejected', () => {
		const now = Date.now();
		const cookie = signSession(SECRET, 'team-1', now - 1000 * 60 * 60 * 24 * 31);

		expect(verifySession(SECRET, cookie, now)).toBeNull();
	});

	it('given a malformed cookie value, when verifying it, then it is rejected', () => {
		expect(verifySession(SECRET, 'not-a-valid-cookie')).toBeNull();
	});
});
