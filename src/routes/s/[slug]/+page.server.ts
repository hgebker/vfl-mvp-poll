import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getSurveyBySlug, getSurveyRoster, surveyTitle } from '$lib/server/domain/surveys';
import { castVote, VoteRejectedError } from '$lib/server/domain/votes';
import { getOrCreateVoteToken, getVoteToken } from '$lib/server/voteToken';

export const load: PageServerLoad = ({ params, cookies }) => {
	const survey = getSurveyBySlug(db, params.slug);
	if (!survey) throw error(404, 'Survey not found');

	const alreadyVoted = survey.status === 'open' && Boolean(getVoteToken(cookies, survey.slug));

	return {
		slug: survey.slug,
		title: surveyTitle(survey),
		status: survey.status,
		alreadyVoted,
		roster: survey.status === 'open' && !alreadyVoted ? getSurveyRoster(db, survey.id) : []
	};
};

export const actions: Actions = {
	default: async ({ params, request, cookies }) => {
		const survey = getSurveyBySlug(db, params.slug);
		if (!survey) throw error(404, 'Survey not found');

		const form = await request.formData();
		const playerIds = form.getAll('playerIds').map(String);

		const token = getOrCreateVoteToken(cookies, survey.slug);

		try {
			castVote(db, survey.id, token, playerIds);
		} catch (err) {
			if (err instanceof VoteRejectedError) {
				return fail(400, { error: err.message });
			}
			throw err;
		}

		return { success: true };
	}
};
