import { describe, expect, it, vi } from 'vitest';
import type { Cookies } from '@sveltejs/kit';

vi.mock('$env/dynamic/private', () => ({ env: { SESSION_SECRET: 'test-secret' } }));

const { addTeamToSession, setActiveTeam, logoutTeam, logoutAll } = await import('./auth');
const { verifySession, SESSION_COOKIE_NAME } = await import('./domain/session');

function fakeCookies(initial?: string): Cookies {
	let value: string | undefined = initial;
	return {
		get: (name: string) => (name === SESSION_COOKIE_NAME ? value : undefined),
		set: (name: string, newValue: string) => {
			if (name === SESSION_COOKIE_NAME) value = newValue;
		},
		delete: (name: string) => {
			if (name === SESSION_COOKIE_NAME) value = undefined;
		}
	} as unknown as Cookies;
}

function readSessionValue(cookies: Cookies) {
	const value = cookies.get(SESSION_COOKIE_NAME);
	return value ? verifySession('test-secret', value) : null;
}

describe('addTeamToSession', () => {
	it('given no existing session, when adding a team, then it becomes the sole active team', () => {
		const cookies = fakeCookies();

		addTeamToSession(cookies, 'team-1');

		expect(readSessionValue(cookies)).toMatchObject({
			teamIds: ['team-1'],
			activeTeamId: 'team-1'
		});
	});

	it('given a session with one team, when adding a different team, then both are present and the new one is active', () => {
		const cookies = fakeCookies();
		addTeamToSession(cookies, 'team-1');

		addTeamToSession(cookies, 'team-2');

		expect(readSessionValue(cookies)).toMatchObject({
			teamIds: ['team-1', 'team-2'],
			activeTeamId: 'team-2'
		});
	});

	it('given a team already in the session, when adding it again, then it is not duplicated and becomes active', () => {
		const cookies = fakeCookies();
		addTeamToSession(cookies, 'team-1');
		addTeamToSession(cookies, 'team-2');

		addTeamToSession(cookies, 'team-1');

		expect(readSessionValue(cookies)).toMatchObject({
			teamIds: ['team-1', 'team-2'],
			activeTeamId: 'team-1'
		});
	});
});

describe('setActiveTeam', () => {
	it('given a session with multiple teams, when setting an already-present team active, then it becomes active', () => {
		const cookies = fakeCookies();
		addTeamToSession(cookies, 'team-1');
		addTeamToSession(cookies, 'team-2');

		setActiveTeam(cookies, 'team-1');

		expect(readSessionValue(cookies)?.activeTeamId).toBe('team-1');
	});

	it('given a team not part of the session, when setting it active, then the session is unchanged', () => {
		const cookies = fakeCookies();
		addTeamToSession(cookies, 'team-1');

		setActiveTeam(cookies, 'team-2');

		expect(readSessionValue(cookies)?.activeTeamId).toBe('team-1');
	});
});

describe('logoutTeam', () => {
	it('given a session with multiple teams, when logging out of the active team, then another team becomes active', () => {
		const cookies = fakeCookies();
		addTeamToSession(cookies, 'team-1');
		addTeamToSession(cookies, 'team-2');

		logoutTeam(cookies, 'team-2');

		expect(readSessionValue(cookies)).toMatchObject({
			teamIds: ['team-1'],
			activeTeamId: 'team-1'
		});
	});

	it('given a session with only one team, when logging out of it, then the session is cleared', () => {
		const cookies = fakeCookies();
		addTeamToSession(cookies, 'team-1');

		logoutTeam(cookies, 'team-1');

		expect(readSessionValue(cookies)).toBeNull();
	});
});

describe('logoutAll', () => {
	it('given a session with multiple teams, when logging out of all, then the session is cleared', () => {
		const cookies = fakeCookies();
		addTeamToSession(cookies, 'team-1');
		addTeamToSession(cookies, 'team-2');

		logoutAll(cookies);

		expect(readSessionValue(cookies)).toBeNull();
	});
});
