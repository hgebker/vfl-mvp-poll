import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireDevopsToken } from '$lib/server/devopsAuth';
import { createTeam } from '$lib/server/domain/teams';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	requireDevopsToken(request);

	const body = await request.json();
	const name = typeof body?.name === 'string' ? body.name.trim() : '';
	const passcode = typeof body?.passcode === 'string' ? body.passcode : '';
	if (!name || !passcode) {
		return json({ error: 'name and passcode are required' }, { status: 400 });
	}

	const team = await createTeam(db, name, passcode);
	return json({ id: team.id, name: team.name, slug: team.slug });
};
