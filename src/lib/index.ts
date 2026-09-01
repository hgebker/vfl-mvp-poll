// place files you want to import through the `$lib` alias in this folder.

import type { RouteId } from '$app/types';

export const ROUTES: Record<RouteId, string> = {
	'/': 'Home',
	'/login': 'Login',
	'/(app)/create': 'Create',
	'/(app)': '',
	'/(app)/admin': '',
	'/(app)/admin/players': 'Players',
	'/(app)/p': '',
	'/(app)/p/[slug]': '',
	'/p': '',
	'/p/[slug]': 'Vote',
	'/p/[slug]/results': 'Results',
	'/(app)/p/[slug]/manage': 'Manage'
};
