CREATE TABLE `site_courses` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`level` varchar(32) NOT NULL DEFAULT 'anhan',
	`format` varchar(32) NOT NULL DEFAULT 'tanhim',
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`syllabus` json NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	`duration_weeks` int NOT NULL DEFAULT 4,
	`schedule` varchar(255) NOT NULL DEFAULT '',
	`start_date` date,
	`seats` int NOT NULL DEFAULT 0,
	`seats_taken` int NOT NULL DEFAULT 0,
	`location` varchar(255) NOT NULL DEFAULT '',
	`cover_url` varchar(1024) NOT NULL DEFAULT '',
	`status` varchar(32) NOT NULL DEFAULT 'published',
	`featured` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `site_courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_courses_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_enrollments` (
	`id` varchar(36) NOT NULL,
	`course_id` varchar(36),
	`course_title` varchar(255) NOT NULL DEFAULT '',
	`name` varchar(255) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320) NOT NULL DEFAULT '',
	`note` text NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL,
	CONSTRAINT `site_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_news` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` text NOT NULL,
	`body` text NOT NULL,
	`cover_url` varchar(1024) NOT NULL DEFAULT '',
	`tag` varchar(64) NOT NULL DEFAULT 'Мэдээ',
	`author` varchar(255) NOT NULL DEFAULT 'Уран бичлэг',
	`status` varchar(32) NOT NULL DEFAULT 'published',
	`featured` boolean NOT NULL DEFAULT false,
	`view_count` int NOT NULL DEFAULT 0,
	`published_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `site_news_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_news_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(36),
	`name` varchar(255) NOT NULL,
	`slug` varchar(191) NOT NULL DEFAULT '',
	`price` int NOT NULL DEFAULT 0,
	`qty` int NOT NULL DEFAULT 1,
	`line_total` int NOT NULL DEFAULT 0,
	CONSTRAINT `site_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_orders` (
	`id` varchar(36) NOT NULL,
	`order_no` varchar(32) NOT NULL,
	`customer_name` varchar(255) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`email` varchar(320) NOT NULL DEFAULT '',
	`address` varchar(512) NOT NULL DEFAULT '',
	`note` text NOT NULL,
	`delivery` varchar(32) NOT NULL DEFAULT 'pickup',
	`subtotal` int NOT NULL DEFAULT 0,
	`shipping` int NOT NULL DEFAULT 0,
	`total` int NOT NULL DEFAULT 0,
	`status` varchar(32) NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `site_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_orders_no_idx` UNIQUE(`order_no`)
);
--> statement-breakpoint
CREATE TABLE `site_products` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(32) NOT NULL DEFAULT 'bichleg',
	`summary` text NOT NULL,
	`body` text NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	`old_price` int NOT NULL DEFAULT 0,
	`cover_url` varchar(1024) NOT NULL DEFAULT '',
	`images` json NOT NULL,
	`stock` int NOT NULL DEFAULT -1,
	`status` varchar(32) NOT NULL DEFAULT 'published',
	`featured` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `site_products_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_products_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` varchar(191) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `site_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `site_toli` (
	`ug_id` int NOT NULL,
	`cyrillic` varchar(191) NOT NULL,
	`mongol` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL,
	CONSTRAINT `site_toli_ug_id` PRIMARY KEY(`ug_id`)
);
--> statement-breakpoint
ALTER TABLE `site_enrollments` ADD CONSTRAINT `site_enrollments_course_id_site_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `site_courses`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_order_items` ADD CONSTRAINT `site_order_items_order_id_site_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `site_orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_order_items` ADD CONSTRAINT `site_order_items_product_id_site_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `site_products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `site_courses_status_idx` ON `site_courses` (`status`);--> statement-breakpoint
CREATE INDEX `site_courses_sort_idx` ON `site_courses` (`sort_order`);--> statement-breakpoint
CREATE INDEX `site_enrollments_course_idx` ON `site_enrollments` (`course_id`);--> statement-breakpoint
CREATE INDEX `site_enrollments_created_idx` ON `site_enrollments` (`created_at`);--> statement-breakpoint
CREATE INDEX `site_news_published_idx` ON `site_news` (`published_at`);--> statement-breakpoint
CREATE INDEX `site_order_items_order_idx` ON `site_order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `site_orders_status_idx` ON `site_orders` (`status`);--> statement-breakpoint
CREATE INDEX `site_orders_created_idx` ON `site_orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `site_products_status_idx` ON `site_products` (`status`);--> statement-breakpoint
CREATE INDEX `site_products_category_idx` ON `site_products` (`category`);--> statement-breakpoint
CREATE INDEX `site_toli_cyrillic_idx` ON `site_toli` (`cyrillic`);