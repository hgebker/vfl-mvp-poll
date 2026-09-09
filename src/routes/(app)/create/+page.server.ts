import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireTeam } from '$lib/server/auth';
import { listPlayers } from '$lib/server/domain/players';
import { createPoll } from '$lib/server/domain/polls';
import type { HomeAway } from '$lib/server/db/schema';
import * as m from '$lib/paraglide/messages';

export const load: PageServerLoad = ({ locals, url }) => {
	const teamId = requireTeam(locals, url.pathname);
	return {
		players: listPlayers(db, teamId, { activeOnly: true }).sort(
			(a, b) => a.jerseyNumber - b.jerseyNumber
		)
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const teamId = requireTeam(locals, url.pathname);
		const form = await request.formData();

		const opponent = String(form.get('opponent') ?? '').trim();
		const matchDate = String(form.get('matchDate') ?? '');
		const homeAway = String(form.get('homeAway') ?? '') as HomeAway;
		const rosterPlayerIds = form.getAll('rosterPlayerIds').map(String);

		if (!opponent) return fail(400, { error: m.create_error_opponent_required() });
		if (!matchDate) return fail(400, { error: m.create_error_date_required() });
		if (homeAway !== 'home' && homeAway !== 'away') {
			return fail(400, { error: m.create_error_home_away_required() });
		}
		if (rosterPlayerIds.length < 2) {
			return fail(400, { error: m.create_error_roster_min() });
		}

		const poll = createPoll(db, teamId, {
			opponent,
			matchDate: new Date(matchDate),
			homeAway,
			rosterPlayerIds
		});

		throw redirect(303, `/p/${poll.slug}/manage`);
	}
};
