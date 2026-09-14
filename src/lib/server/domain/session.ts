import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE_NAME = 'session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export interface SessionPayload {
	teamIds: string[];
	activeTeamId: string;
	expiresAt: number;
}

/** Signs a set of team ids + the active one + expiry into an opaque cookie value (payload.signature, base64url). */
export function signSession(
	secret: string,
	teamIds: string[],
	activeTeamId: string,
	now = Date.now()
): string {
	const payload: SessionPayload = { teamIds, activeTeamId, expiresAt: now + SESSION_TTL_MS };
	const encoded = base64url(JSON.stringify(payload));
	const signature = sign(secret, encoded);
	return `${encoded}.${signature}`;
}

/** Verifies signature + expiry, returning the session payload or null if invalid/expired/tampered. */
export function verifySession(
	secret: string,
	cookieValue: string,
	now = Date.now()
): SessionPayload | null {
	const [encoded, signature] = cookieValue.split('.');
	if (!encoded || !signature) return null;

	const expectedSignature = sign(secret, encoded);
	if (!safeEqual(signature, expectedSignature)) return null;

	let payload: SessionPayload;
	try {
		payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
	} catch {
		return null;
	}

	if (
		!Array.isArray(payload.teamIds) ||
		!payload.teamIds.every((id) => typeof id === 'string') ||
		typeof payload.activeTeamId !== 'string' ||
		typeof payload.expiresAt !== 'number'
	) {
		return null;
	}
	if (!payload.teamIds.includes(payload.activeTeamId)) return null;
	if (payload.expiresAt < now) return null;

	return payload;
}

export { SESSION_COOKIE_NAME };

function sign(secret: string, value: string): string {
	return createHmac('sha256', secret).update(value).digest('base64url');
}

function base64url(value: string): string {
	return Buffer.from(value, 'utf8').toString('base64url');
}

function safeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}
