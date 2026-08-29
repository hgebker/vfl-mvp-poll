// place files you want to import through the `$lib` alias in this folder.

import type { RouteId } from '$app/types';

export const ROUTES: Record<RouteId, string> = {
	'/': 'Home',
	'/login': 'Login',
	'/(app)/create': 'Create',
	'/(app)': '',
	'/(app)/admin': '',
	'/(app)/admin/players': 'Players',
	'/(app)/s': '',
	'/(app)/s/[slug]': '',
	'/s': '',
	'/s/[slug]': 'Vote',
	'/s/[slug]/results': 'Results',
	'/(app)/s/[slug]/manage': 'Manage'
};
