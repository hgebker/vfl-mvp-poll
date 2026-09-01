ALTER TABLE `players` ADD `jersey_number` integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `players_team_jersey_number_unique` ON `players` (`team_id`,`jersey_number`);