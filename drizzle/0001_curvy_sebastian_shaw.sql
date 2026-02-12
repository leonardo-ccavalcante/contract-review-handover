CREATE TABLE `ai_extractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`extractionId` varchar(64) NOT NULL,
	`callId` varchar(64) NOT NULL,
	`extractedAt` timestamp NOT NULL DEFAULT (now()),
	`confidenceScoreOverall` int,
	`extractedData` json,
	`flags` json,
	`processingTimeSeconds` int,
	`modelUsed` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_extractions_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_extractions_extractionId_unique` UNIQUE(`extractionId`)
);
--> statement-breakpoint
CREATE TABLE `call_transcriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`callId` varchar(64) NOT NULL,
	`uploadedBy` int NOT NULL,
	`uploadTimestamp` timestamp NOT NULL DEFAULT (now()),
	`transcriptionText` text NOT NULL,
	`merchantName` varchar(255),
	`salesManagerId` varchar(64),
	`callDate` timestamp,
	`callDurationMinutes` int,
	`fileFormat` varchar(20),
	`fileSize` int,
	`audioFileUrl` text,
	`audioFileKey` text,
	`transcriptionFileUrl` text,
	`transcriptionFileKey` text,
	`status` enum('uploaded','processing','extracted','failed') NOT NULL DEFAULT 'uploaded',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `call_transcriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `call_transcriptions_callId_unique` UNIQUE(`callId`)
);
--> statement-breakpoint
CREATE TABLE `contract_audits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`auditId` varchar(64) NOT NULL,
	`contractId` varchar(64) NOT NULL,
	`auditTimestamp` timestamp NOT NULL DEFAULT (now()),
	`discrepanciesFound` boolean DEFAULT false,
	`discrepancyCount` int DEFAULT 0,
	`discrepancies` json,
	`highestSeverity` enum('HIGH','MEDIUM','LOW','NONE'),
	`actionRequired` varchar(100),
	`blocksGoLive` boolean DEFAULT false,
	`sla` varchar(50),
	`assignedTo` int,
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`resolutionNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contract_audits_id` PRIMARY KEY(`id`),
	CONSTRAINT `contract_audits_auditId_unique` UNIQUE(`auditId`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` varchar(64) NOT NULL,
	`merchantId` varchar(64) NOT NULL,
	`sourceCallId` varchar(64),
	`contractPdfUrl` text NOT NULL,
	`contractPdfKey` text NOT NULL,
	`contractSignedAt` timestamp,
	`uploadedBy` int NOT NULL,
	`contractStatus` enum('uploaded','extracting','validated','validated_with_warnings','validated_minor_notes','blocked_high_discrepancy','failed') NOT NULL DEFAULT 'uploaded',
	`extractedTerms` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contracts_contractId_unique` UNIQUE(`contractId`)
);
--> statement-breakpoint
CREATE TABLE `exception_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exceptionId` varchar(64) NOT NULL,
	`exceptionType` enum('data_quality','validation_failure','audit_discrepancy','extraction_error','system_error') NOT NULL,
	`priority` enum('P0','P1','P2','P3') NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` varchar(64),
	`description` text NOT NULL,
	`errorDetails` json,
	`assignedTo` int,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`resolutionNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exception_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `exception_logs_exceptionId_unique` UNIQUE(`exceptionId`)
);
--> statement-breakpoint
CREATE TABLE `merchant_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`profileId` varchar(64) NOT NULL,
	`merchantId` varchar(64) NOT NULL,
	`merchantName` varchar(255) NOT NULL,
	`profileVersion` int NOT NULL DEFAULT 1,
	`sourceCallId` varchar(64),
	`segment` enum('SMB','MM','Enterprise') DEFAULT 'SMB',
	`contractTerms` json,
	`businessContext` json,
	`ownerProfile` json,
	`marketIntelligence` json,
	`profileSummary` text,
	`overallConfidence` int,
	`humanReviewRequired` boolean DEFAULT false,
	`assignedAccountManager` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchant_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `merchant_profiles_profileId_unique` UNIQUE(`profileId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` varchar(64) NOT NULL,
	`recipientId` int NOT NULL,
	`notificationType` enum('handover','discrepancy','validation_required','extraction_complete','system_alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` varchar(64),
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `notifications_notificationId_unique` UNIQUE(`notificationId`)
);
--> statement-breakpoint
CREATE TABLE `validation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` varchar(64) NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`ruleType` enum('mandatory_field','confidence_threshold','business_logic') NOT NULL,
	`ruleConfig` json,
	`isActive` boolean DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `validation_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `validation_rules_ruleId_unique` UNIQUE(`ruleId`)
);
--> statement-breakpoint
CREATE TABLE `validations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`validationId` varchar(64) NOT NULL,
	`extractionId` varchar(64) NOT NULL,
	`merchantId` varchar(64),
	`validationStatus` enum('PASS','FAIL','MANUAL_REVIEW','VALIDATED_AUTO','VALIDATED_MANUAL','VALIDATED_OVERRIDE','BLOCKED_INCOMPLETE') NOT NULL,
	`validationTimestamp` timestamp NOT NULL DEFAULT (now()),
	`mandatoryFieldsComplete` boolean DEFAULT false,
	`aiConfidenceThresholdMet` boolean DEFAULT false,
	`missingFields` json,
	`lowConfidenceFields` json,
	`nextAction` varchar(100),
	`blockingReasons` json,
	`canProceedToContract` boolean DEFAULT false,
	`overrideAvailable` boolean DEFAULT true,
	`overrideBy` int,
	`overrideJustification` text,
	`overrideTimestamp` timestamp,
	`reviewedBy` int,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `validations_id` PRIMARY KEY(`id`),
	CONSTRAINT `validations_validationId_unique` UNIQUE(`validationId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','account_manager','sales_ops','sales_manager') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `ai_extractions` ADD CONSTRAINT `ai_extractions_callId_call_transcriptions_callId_fk` FOREIGN KEY (`callId`) REFERENCES `call_transcriptions`(`callId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `call_transcriptions` ADD CONSTRAINT `call_transcriptions_uploadedBy_users_id_fk` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_audits` ADD CONSTRAINT `contract_audits_contractId_contracts_contractId_fk` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`contractId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_audits` ADD CONSTRAINT `contract_audits_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contract_audits` ADD CONSTRAINT `contract_audits_resolvedBy_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_sourceCallId_call_transcriptions_callId_fk` FOREIGN KEY (`sourceCallId`) REFERENCES `call_transcriptions`(`callId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_uploadedBy_users_id_fk` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exception_logs` ADD CONSTRAINT `exception_logs_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exception_logs` ADD CONSTRAINT `exception_logs_resolvedBy_users_id_fk` FOREIGN KEY (`resolvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `merchant_profiles` ADD CONSTRAINT `merchant_profiles_sourceCallId_call_transcriptions_callId_fk` FOREIGN KEY (`sourceCallId`) REFERENCES `call_transcriptions`(`callId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `merchant_profiles` ADD CONSTRAINT `merchant_profiles_assignedAccountManager_users_id_fk` FOREIGN KEY (`assignedAccountManager`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `merchant_profiles` ADD CONSTRAINT `merchant_profiles_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipientId_users_id_fk` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `validation_rules` ADD CONSTRAINT `validation_rules_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `validations` ADD CONSTRAINT `validations_extractionId_ai_extractions_extractionId_fk` FOREIGN KEY (`extractionId`) REFERENCES `ai_extractions`(`extractionId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `validations` ADD CONSTRAINT `validations_overrideBy_users_id_fk` FOREIGN KEY (`overrideBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `validations` ADD CONSTRAINT `validations_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;