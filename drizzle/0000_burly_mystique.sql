CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`jersey_number` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_team_jersey_number_unique` ON `players` (`team_id`,`jersey_number`);--> statement-breakpoint
CREATE TABLE `poll_players` (
	`poll_id` text NOT NULL,
	`player_id` text NOT NULL,
	PRIMARY KEY(`poll_id`, `player_id`),
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `polls` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`slug` text NOT NULL,
	`opponent` text NOT NULL,
	`match_date` integer NOT NULL,
	`home_away` text NOT NULL,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`opens_at` integer,
	`closes_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `polls_slug_unique` ON `polls` (`slug`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`passcode_hash` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_slug_unique` ON `teams` (`slug`);--> statement-breakpoint
CREATE TABLE `vote_receipts` (
	`poll_id` text NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`poll_id`, `token`),
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`poll_id` text NOT NULL,
	`player_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`poll_id`) REFERENCES `polls`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
