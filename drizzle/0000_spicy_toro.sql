CREATE TABLE `records` (
	`user_id` text NOT NULL,
	`id` text NOT NULL,
	`payload` text NOT NULL,
	`updated` integer NOT NULL,
	PRIMARY KEY(`user_id`, `id`)
);
