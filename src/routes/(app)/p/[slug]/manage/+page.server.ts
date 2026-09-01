import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireTeam } from '$lib/server/auth';
import { deletePoll, getPollBySlug, getPollRoster, pollTitle } from '$lib/server/domain/polls';
import { InvalidTransitionError, transition } from '$lib/server/domain/status';
import type { PollStatus } from '$lib/server/db/schema';

export const load: PageServerLoad = ({ params, locals, url }) => {
	requireTeam(locals, url.pathname);

	const poll = getPollBySlug(db, params.slug);
	if (!poll) throw error(404, 'Poll not found');

	return {
		slug: poll.slug,
		title: pollTitle(poll),
		status: poll.status,
		shareUrl: `${url.origin}/p/${poll.slug}`,
		roster: getPollRoster(db, poll.id)
	};
};

export const actions: Actions = {
	transition: async ({ params, locals, url, request }) => {
		requireTeam(locals, url.pathname);

		const poll = getPollBySlug(db, params.slug);
		if (!poll) throw error(404, 'Poll not found');

		const form = await request.formData();
		const next = String(form.get('next') ?? '') as PollStatus;

		try {
			transition(db, poll.id, next);
		} catch (err) {
			if (err instanceof InvalidTransitionError) {
				return fail(400, { error: err.message });
			}
			throw err;
		}

		throw redirect(303, url.pathname);
	},

	delete: async ({ params, locals, url }) => {
		const teamId = requireTeam(locals, url.pathname);

		const poll = getPollBySlug(db, params.slug);
		if (!poll) throw error(404, 'Poll not found');

		deletePoll(db, teamId, poll.id);

		throw redirect(303, '/');
	}
};
