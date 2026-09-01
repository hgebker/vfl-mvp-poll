import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getPollBySlug, getPollRoster, pollTitle } from '$lib/server/domain/polls';
import { castVote, VoteRejectedError } from '$lib/server/domain/votes';
import { getOrCreateVoteToken, getVoteToken } from '$lib/server/voteToken';

export const load: PageServerLoad = ({ params, cookies }) => {
	const poll = getPollBySlug(db, params.slug);
	if (!poll) throw error(404, 'Poll not found');

	const alreadyVoted = poll.status === 'open' && Boolean(getVoteToken(cookies, poll.slug));

	return {
		slug: poll.slug,
		title: pollTitle(poll),
		status: poll.status,
		alreadyVoted,
		roster: poll.status === 'open' && !alreadyVoted ? getPollRoster(db, poll.id) : []
	};
};

export const actions: Actions = {
	default: async ({ params, request, cookies }) => {
		const poll = getPollBySlug(db, params.slug);
		if (!poll) throw error(404, 'Poll not found');

		const form = await request.formData();
		const playerIds = form.getAll('playerIds').map(String);

		const token = getOrCreateVoteToken(cookies, poll.slug);

		try {
			castVote(db, poll.id, token, playerIds);
		} catch (err) {
			if (err instanceof VoteRejectedError) {
				return fail(400, { error: err.message });
			}
			throw err;
		}

		return { success: true };
	}
};
