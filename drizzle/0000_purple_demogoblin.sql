CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`created` integer NOT NULL,
	`data` text NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`assignee` text DEFAULT '' NOT NULL,
	`followup` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `leads_owner_created` ON `leads` (`owner`,`created`);