-- MySQL Database Export for Digital Sheba
-- Use this file to import into your cPanel MySQL Database

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table structure for table `books`
CREATE TABLE IF NOT EXISTS `books` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `thumbnailUrl` text DEFAULT NULL,
  `fileType` varchar(50) DEFAULT NULL,
  `previewUrl` text DEFAULT NULL,
  `downloadUrl` text DEFAULT NULL,
  `categoryId` varchar(255) DEFAULT NULL,
  `driveFileId` varchar(255) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `hidden` tinyint(1) DEFAULT 0,
  `createdAt` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `driveFileId` (`driveFileId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

-- Table structure for table `categories`
CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial categories
INSERT IGNORE INTO `categories` (`id`, `name`, `slug`) VALUES
('cat1', 'Programming', 'programming'),
('cat2', 'Design', 'design'),
('cat3', 'Business', 'business');

-- --------------------------------------------------------

-- Table structure for table `settings`
CREATE TABLE IF NOT EXISTS `settings` (
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial settings
-- homePassword is 'admin123'
INSERT IGNORE INTO `settings` (`key`, `value`) VALUES
('logoUrl', ''),
('faviconUrl', ''),
('homePassword', 'admin123'),
('siteName', 'Digital Sheba - Premium E-Book Library');

-- --------------------------------------------------------

-- Table structure for table `users`
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user
-- Email: admin@example.com
-- Password: admin123
-- Verified bcrypt hash for 'admin123'
INSERT IGNORE INTO `users` (`id`, `email`, `password`) VALUES
('admin', 'admin@example.com', '$2b$10$KKOMTHocQix9YO3H/oXSW.sKq2t.uJfa6B92zubnQsKh7jY4ZSioW');

COMMIT;
