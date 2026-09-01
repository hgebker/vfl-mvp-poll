import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireTeam } from '$lib/server/auth';
import { createPlayer, listPlayers, setPlayerActive } from '$lib/server/domain/players';

export const load: PageServerLoad = ({ locals, url }) => {
	const teamId = requireTeam(locals, url.pathname);
	return { players: listPlayers(db, teamId).sort((a, b) => a.jerseyNumber - b.jerseyNumber) };
};

export const actions: Actions = {
	create: async ({ request, locals, url }) => {
		const teamId = requireTeam(locals, url.pathname);
		const form = await request.formData();
		const firstName = String(form.get('firstName') ?? '').trim();
		const lastName = String(form.get('lastName') ?? '').trim();
		const jerseyNumberRaw = String(form.get('jerseyNumber') ?? '').trim();
		const jerseyNumber = Number(jerseyNumberRaw);

		if (!firstName || !lastName) {
			return fail(400, { error: 'Enter both first and last name.' });
		}

		if (
			!jerseyNumberRaw ||
			!Number.isInteger(jerseyNumber) ||
			jerseyNumber < 0 ||
			jerseyNumber > 99
		) {
			return fail(400, { error: 'Enter a jersey number between 0 and 99.' });
		}

		try {
			createPlayer(db, teamId, firstName, lastName, jerseyNumber);
		} catch {
			return fail(400, { error: 'That jersey number is already taken.' });
		}
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
