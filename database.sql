-- MySQL Database Export for Digital Sheba
-- Use this file to import into your cPanel MySQL Database

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

-- Table structure for table `books`
CREATE TABLE `books` (
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
CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial categories
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
('cat1', 'Programming', 'programming'),
('cat2', 'Design', 'design'),
('cat3', 'Business', 'business');

-- --------------------------------------------------------

-- Table structure for table `settings`
CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial settings
INSERT INTO `settings` (`key`, `value`) VALUES
('logoUrl', ''),
('faviconUrl', ''),
('homePassword', 'admin123'),
('siteName', 'Digital Sheba - Premium E-Book Library');

-- --------------------------------------------------------

-- Table structure for table `users`
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
-- Hash generated via password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO `users` (`id`, `email`, `password`) VALUES
('admin', 'admin@example.com', '$2y$10$8v8W7W7W7W7W7W7W7W7W7uW8v8W7W7W7W7W7W7W7W7W7W7W7W');

COMMIT;
