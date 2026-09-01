import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { requireTeam } from '$lib/server/auth';
import {
	deleteSurvey,
	getSurveyBySlug,
	getSurveyRoster,
	surveyTitle
} from '$lib/server/domain/surveys';
import { InvalidTransitionError, transition } from '$lib/server/domain/status';
import type { SurveyStatus } from '$lib/server/db/schema';

export const load: PageServerLoad = ({ params, locals, url }) => {
	requireTeam(locals, url.pathname);

	const survey = getSurveyBySlug(db, params.slug);
	if (!survey) throw error(404, 'Survey not found');

	return {
		slug: survey.slug,
		title: surveyTitle(survey),
		status: survey.status,
		shareUrl: `${url.origin}/s/${survey.slug}`,
		roster: getSurveyRoster(db, survey.id)
	};
};

export const actions: Actions = {
	transition: async ({ params, locals, url, request }) => {
		requireTeam(locals, url.pathname);

		const survey = getSurveyBySlug(db, params.slug);
		if (!survey) throw error(404, 'Survey not found');

		const form = await request.formData();
		const next = String(form.get('next') ?? '') as SurveyStatus;

		try {
			transition(db, survey.id, next);
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

		const survey = getSurveyBySlug(db, params.slug);
		if (!survey) throw error(404, 'Survey not found');

		deleteSurvey(db, teamId, survey.id);

		throw redirect(303, '/');
	}
};
