

SET FOREIGN_KEY_CHECKS = 0;

-- Table: Category
CREATE TABLE IF NOT EXISTS `Category` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Sermon
CREATE TABLE IF NOT EXISTS `Sermon` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `speaker` VARCHAR(191) NULL,
  `date` DATETIME NOT NULL,
  `durationMinutes` INT NULL,
  `thumbnailUrl` VARCHAR(500) NULL,
  `videoUrl` VARCHAR(500) NULL,
  `categoryId` VARCHAR(191) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_categoryId` (`categoryId`),
  KEY `idx_date` (`date`),
  CONSTRAINT `sermon_category_fk` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Message (contact form submissions)
CREATE TABLE IF NOT EXISTS `Message` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `subject` VARCHAR(191) NULL,
  `message` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Event
CREATE TABLE IF NOT EXISTS `Event` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `location` VARCHAR(191) NULL,
  `posterUrl` VARCHAR(500) NULL,
  `startAt` DATETIME NOT NULL,
  `endAt` DATETIME NULL,
  `isPublished` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_startAt` (`startAt`),
  KEY `idx_isPublished` (`isPublished`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Pastor
CREATE TABLE IF NOT EXISTS `Pastor` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `roleTitle` VARCHAR(191) NULL,
  `bio` TEXT NULL,
  `photoUrl` VARCHAR(500) NULL,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isPublished` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_name` (`name`),
  KEY `idx_sortOrder` (`sortOrder`),
  KEY `idx_isPublished` (`isPublished`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Ministry
CREATE TABLE IF NOT EXISTS `Ministry` (
  `id` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `highlights` JSON NULL,
  `imageUrl` VARCHAR(500) NULL,
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isPublished` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_sortOrder` (`sortOrder`),
  KEY `idx_isPublished` (`isPublished`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: SiteSettings
CREATE TABLE IF NOT EXISTS `SiteSettings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `siteName` VARCHAR(191) NOT NULL,
  `shortName` VARCHAR(191) NOT NULL,
  `tagline` VARCHAR(191) NOT NULL,
  `location` VARCHAR(191) NOT NULL,
  `logoUrl` VARCHAR(500) NULL,
  `addressLine1` VARCHAR(191) NULL,
  `addressLine2` VARCHAR(191) NULL,
  `phoneDisplay` VARCHAR(191) NULL,
  `phoneTel` VARCHAR(191) NULL,
  `email` VARCHAR(191) NULL,
  `youtubeUrl` VARCHAR(500) NULL,
  `facebookUrl` VARCHAR(500) NULL,
  `instagramUrl` VARCHAR(500) NULL,
  `tiktokUrl` VARCHAR(500) NULL,
  `linktreeUrl` VARCHAR(500) NULL,
  `liveEmbedUrl` VARCHAR(500) NULL,
  `serviceTimes` JSON NULL,
  `school` JSON NULL,
  `giving` JSON NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Donation
CREATE TABLE IF NOT EXISTS `Donation` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'KES',
  `note` TEXT NULL,
  `method` VARCHAR(50) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional - customize as needed)

INSERT INTO `Category` (`id`, `slug`, `name`) VALUES
('faith', 'faith', 'Faith'),
('prayer', 'prayer', 'Prayer'),
('family', 'family', 'Family'),
('worship', 'worship', 'Worship')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `SiteSettings` (`siteName`, `shortName`, `tagline`, `location`, `email`, `phoneTel`, `phoneDisplay`, `addressLine1`, `addressLine2`) VALUES
('Deliverance Church Utawala', 'DC Utawala', 'The Church of Choice', 'Utawala, Nairobi, Kenya', 'info@deliveranceutawala.org', '+254700000000', '+254 700 000 000', 'Utawala, Nairobi, Kenya', 'Utawala Road')
ON DUPLICATE KEY UPDATE `siteName` = VALUES(`siteName`);

SET FOREIGN_KEY_CHECKS = 1;
