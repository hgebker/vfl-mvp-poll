import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** Guard for devops-only HTTP endpoints: requires `Authorization: Bearer <DEVOPS_TOKEN>`. */
export function requireDevopsToken(request: Request): void {
	if (!env.DEVOPS_TOKEN) throw new Error('DEVOPS_TOKEN is not set');

	const authHeader = request.headers.get('authorization') ?? '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

	if (token !== env.DEVOPS_TOKEN) throw error(401, 'Unauthorized');
}
