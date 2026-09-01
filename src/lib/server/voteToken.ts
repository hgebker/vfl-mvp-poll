import { randomUUID } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

/**
 * Per-poll dedupe cookie. The cookie's presence is what the UI uses to
 * show "you already voted"; `castVote`'s receipt-table check is the actual
 * source of truth that prevents a second ballot from being counted.
 */
function cookieName(pollSlug: string): string {
	return `voted_${pollSlug}`;
}

export function getVoteToken(cookies: Cookies, pollSlug: string): string | undefined {
	return cookies.get(cookieName(pollSlug));
}

/** Returns the existing token if present, otherwise mints and stores a new one. */
export function getOrCreateVoteToken(cookies: Cookies, pollSlug: string): string {
	const existing = getVoteToken(cookies, pollSlug);
	if (existing) return existing;

	const token = randomUUID();
	cookies.set(cookieName(pollSlug), token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 365
	});
	return token;
}
