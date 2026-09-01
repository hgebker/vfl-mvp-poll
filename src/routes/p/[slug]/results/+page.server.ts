import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getPollBySlug, getPollRoster, pollTitle } from '$lib/server/domain/polls';
import { getResults, getTimeline, ResultsNotAvailableError } from '$lib/server/domain/tally';

export const load: PageServerLoad = ({ params }) => {
	const poll = getPollBySlug(db, params.slug);
	if (!poll) throw error(404, 'Poll not found');

	try {
		const results = getResults(db, poll.id);
		const timeline = getTimeline(db, poll.id);
		return {
			title: pollTitle(poll),
			results: results.map((r) => ({ ...r, name: `${r.firstName} ${r.lastName}` })),
			timeline,
			roster: getPollRoster(db, poll.id)
		};
	} catch (err) {
		if (err instanceof ResultsNotAvailableError) {
			throw error(403, err.message);
		}
		throw err;
	}
};
