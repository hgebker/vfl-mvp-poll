import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireTeam } from '$lib/server/auth';
import { createPlayer, listPlayers, setPlayerActive } from '$lib/server/domain/players';

export const load: PageServerLoad = ({ locals, url }) => {
	const teamId = requireTeam(locals, url.pathname);
	return { players: listPlayers(db, teamId) };
};

export const actions: Actions = {
	create: async ({ request, locals, url }) => {
		const teamId = requireTeam(locals, url.pathname);
		const form = await request.formData();
		const firstName = String(form.get('firstName') ?? '').trim();
		const lastName = String(form.get('lastName') ?? '').trim();

		if (!firstName || !lastName) {
			return fail(400, { error: 'Enter both first and last name.' });
		}

		createPlayer(db, teamId, firstName, lastName);
	},

	toggleActive: async ({ request, locals, url }) => {
		const teamId = requireTeam(locals, url.pathname);
		const form = await request.formData();
		const playerId = String(form.get('playerId') ?? '');
		const active = form.get('active') === 'true';

		if (!playerId) return fail(400, { error: 'Missing player.' });

		setPlayerActive(db, teamId, playerId, active);
	}
};
