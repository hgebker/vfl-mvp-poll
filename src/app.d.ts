// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			title?: string;
		}
		interface Locals {
			/** Set by hooks.server.ts when a valid team-member session cookie is present. */
			teamId: string | null;
			/** All team ids the current session is logged into (empty when signed out). */
			teamIds: string[];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
