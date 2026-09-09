// place files you want to import through the `$lib` alias in this folder.

import type { RouteId } from '$app/types';
import * as m from '$lib/paraglide/messages';

export function routeTitle(routeId: RouteId): string {
	const titles: Record<RouteId, string> = {
		'/': m.route_home(),
		'/login': m.route_login(),
		'/(app)/create': m.route_create(),
		'/(app)': '',
		'/(app)/admin': '',
		'/(app)/admin/players': m.route_players(),
		'/(app)/p': '',
		'/(app)/p/[slug]': '',
		'/p': '',
		'/p/[slug]': m.route_vote(),
		'/p/[slug]/results': m.route_results(),
		'/(app)/p/[slug]/manage': m.route_manage()
	};

	return titles[routeId];
}
