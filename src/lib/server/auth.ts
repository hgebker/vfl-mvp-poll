import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { signSession, verifySession, SESSION_COOKIE_NAME } from './domain/session';
import type { Cookies } from '@sveltejs/kit';

const TWENTY_FOUR_HOURS_IN_SECONDS = 60 * 60 * 24;

const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax',
	secure: !isDev(),
	maxAge: TWENTY_FOUR_HOURS_IN_SECONDS
} as const;

/** Guard for team-member-only routes: redirects to /login (with a return path) if not signed in. */
export function requireTeam(locals: App.Locals, currentPath: string): string {
	if (!locals.teamId) {
		const redirectTo = encodeURIComponent(currentPath);
		throw redirect(303, `/login?redirectTo=${redirectTo}`);
	}
	return locals.teamId;
}

/** Adds teamId to the current session (if any) and makes it the active team. */
export function addTeamToSession(cookies: Cookies, teamId: string): void {
	const session = readSession(cookies);
	const teamIds = session ? Array.from(new Set([...session.teamIds, teamId])) : [teamId];
	writeSession(cookies, teamIds, teamId);
}

/** Sets which already-logged-in team is active. No-ops if teamId isn't part of the session. */
export function setActiveTeam(cookies: Cookies, teamId: string): void {
	const session = readSession(cookies);
	if (!session || !session.teamIds.includes(teamId)) return;
	writeSession(cookies, session.teamIds, teamId);
}

/** Removes teamId from the session. A remaining team becomes active, or the cookie is cleared if none are left. */
export function logoutTeam(cookies: Cookies, teamId: string): void {
	const session = readSession(cookies);
	if (!session) return;

	const teamIds = session.teamIds.filter((id) => id !== teamId);
	if (teamIds.length === 0) {
		logoutAll(cookies);
		return;
	}

	const activeTeamId = session.activeTeamId === teamId ? teamIds[0] : session.activeTeamId;
	writeSession(cookies, teamIds, activeTeamId);
}

/** Clears the session entirely, logging out of every team. */
export function logoutAll(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

function readSession(cookies: Cookies) {
	if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');
	const cookieValue = cookies.get(SESSION_COOKIE_NAME);
	return cookieValue ? verifySession(env.SESSION_SECRET, cookieValue) : null;
}

function writeSession(cookies: Cookies, teamIds: string[], activeTeamId: string): void {
	if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not set');
	cookies.set(
		SESSION_COOKIE_NAME,
		signSession(env.SESSION_SECRET, teamIds, activeTeamId),
		COOKIE_OPTIONS
	);
}

function isDev(): boolean {
	return process.env.NODE_ENV !== 'production';
}
