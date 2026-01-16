-- CloudVault Database Initialization
CREATE DATABASE IF NOT EXISTS myapp_db;
USE myapp_db;

-- Users Table (Enhanced)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  storage_used BIGINT DEFAULT 0,
  storage_limit BIGINT DEFAULT 10737418240,  -- 10GB default
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Folders Table
CREATE TABLE IF NOT EXISTS folders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_folder_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  color VARCHAR(7) DEFAULT '#4f46e5',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_parent_folder (parent_folder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Files Table
CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) DEFAULT 'application/octet-stream',
  folder_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  description TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_folder_id (folder_id),
  INDEX idx_upload_date (upload_date),
  INDEX idx_file_type (file_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File Shares Table
CREATE TABLE IF NOT EXISTS file_shares (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL,
  shared_by_user_id INT NOT NULL,
  shared_with_user_id INT NOT NULL,
  permission ENUM('view', 'edit') DEFAULT 'view',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_with_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_share (file_id, shared_with_user_id),
  INDEX idx_shared_with (shared_with_user_id),
  INDEX idx_shared_by (shared_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type ENUM('file', 'folder', 'share', 'user') NOT NULL,
  resource_id INT NOT NULL,
  resource_name VARCHAR(255),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_resource (resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Sample Users (Password is 'password123' hashed simplified)
INSERT INTO users (name, email, password, avatar_url, storage_used, last_login) VALUES
  ('Sarah Johnson', 'sarah.johnson@cloudvault.com', '$2a$10$xK7vV6Y.hS3N.yD.rE.m.O.i.C.u.h.F.v.S.e.c.r.e.t', NULL, 2147483648, NOW()),
  ('Michael Chen', 'michael.chen@cloudvault.com', '$2a$10$xK7vV6Y.hS3N.yD.rE.m.O.i.C.u.h.F.v.S.e.c.r.e.t', NULL, 1073741824, NOW()),
  ('Emma Williams', 'emma.williams@cloudvault.com', '$2a$10$xK7vV6Y.hS3N.yD.rE.m.O.i.C.u.h.F.v.S.e.c.r.e.t', NULL, 536870912, NOW()),
  ('David Martinez', 'david.martinez@cloudvault.com', '$2a$10$xK7vV6Y.hS3N.yD.rE.m.O.i.C.u.h.F.v.S.e.c.r.e.t', NULL, 268435456, NOW())
ON DUPLICATE KEY UPDATE name=name;

-- Get user IDs for relationships
SET @user1 = (SELECT id FROM users WHERE email = 'sarah.johnson@cloudvault.com');
SET @user2 = (SELECT id FROM users WHERE email = 'michael.chen@cloudvault.com');
SET @user3 = (SELECT id FROM users WHERE email = 'emma.williams@cloudvault.com');
SET @user4 = (SELECT id FROM users WHERE email = 'david.martinez@cloudvault.com');

-- Insert Sample Folders
INSERT INTO folders (name, parent_folder_id, user_id, color) VALUES
  ('Documents', NULL, @user1, '#4f46e5'),
  ('Photos', NULL, @user1, '#ec4899'),
  ('Work', NULL, @user1, '#f59e0b'),
  ('Projects', 1, @user1, '#8b5cf6'),
  ('Personal', 1, @user1, '#10b981'),
  ('Design Files', NULL, @user2, '#06b6d4'),
  ('Videos', NULL, @user3, '#ef4444');

-- Get folder IDs
SET @folder_docs = (SELECT id FROM folders WHERE name = 'Documents' AND user_id = @user1 LIMIT 1);
SET @folder_photos = (SELECT id FROM folders WHERE name = 'Photos' AND user_id = @user1 LIMIT 1);
SET @folder_work = (SELECT id FROM folders WHERE name = 'Work' AND user_id = @user1 LIMIT 1);
SET @folder_projects = (SELECT id FROM folders WHERE name = 'Projects' AND user_id = @user1 LIMIT 1);
SET @folder_design = (SELECT id FROM folders WHERE name = 'Design Files' AND user_id = @user2 LIMIT 1);

-- Insert Sample Files
INSERT INTO files (filename, file_size, file_type, folder_id, user_id, description, is_favorite) VALUES
  ('Project Proposal.pdf', 2456789, 'application/pdf', @folder_work, @user1, 'Q1 2026 Project Proposal', TRUE),
  ('Budget Report.xlsx', 456123, 'application/vnd.ms-excel', @folder_work, @user1, 'Annual budget analysis', FALSE),
  ('Meeting Notes.docx', 89456, 'application/msword', @folder_docs, @user1, 'Team meeting January 2026', FALSE),
  ('Vacation.jpg', 3456789, 'image/jpeg', @folder_photos, @user1, 'Summer vacation photo', TRUE),
  ('Presentation.pptx', 5678901, 'application/vnd.ms-powerpoint', @folder_projects, @user1, 'Client presentation deck', TRUE),
  ('Contract.pdf', 1234567, 'application/pdf', @folder_docs, @user1, 'Service contract', FALSE),
  ('Logo Design.ai', 8901234, 'application/illustrator', @folder_design, @user2, 'Company logo variations', TRUE),
  ('Website Mockup.fig', 4567890, 'application/figma', @folder_design, @user2, 'Homepage redesign', TRUE),
  ('Product Demo.mp4', 45678901, 'video/mp4', NULL, @user3, 'Product demonstration video', FALSE),
  ('Invoice_2026.pdf', 234567, 'application/pdf', NULL, @user4, 'January invoices', FALSE);

-- Get file IDs for shares
SET @file1 = (SELECT id FROM files WHERE filename = 'Project Proposal.pdf' LIMIT 1);
SET @file2 = (SELECT id FROM files WHERE filename = 'Presentation.pptx' LIMIT 1);
SET @file3 = (SELECT id FROM files WHERE filename = 'Logo Design.ai' LIMIT 1);

-- Insert Sample File Shares
INSERT INTO file_shares (file_id, shared_by_user_id, shared_with_user_id, permission) VALUES
  (@file1, @user1, @user2, 'view'),
  (@file1, @user1, @user3, 'edit'),
  (@file2, @user1, @user4, 'view'),
  (@file3, @user2, @user1, 'view');

-- Insert Sample Activity Logs
INSERT INTO activity_logs (user_id, action, resource_type, resource_id, resource_name, details) VALUES
  (@user1, 'uploaded', 'file', @file1, 'Project Proposal.pdf', 'Uploaded to Work folder'),
  (@user1, 'created', 'folder', @folder_work, 'Work', 'Created new folder'),
  (@user1, 'shared', 'file', @file1, 'Project Proposal.pdf', 'Shared with Michael Chen'),
  (@user2, 'uploaded', 'file', @file3, 'Logo Design.ai', 'Uploaded to Design Files'),
  (@user3, 'uploaded', 'file', (SELECT id FROM files WHERE filename = 'Product Demo.mp4' LIMIT 1), 'Product Demo.mp4', 'Uploaded video file'),
  (@user1, 'favorited', 'file', @file2, 'Presentation.pptx', 'Marked as favorite');

-- Display summary
SELECT 'Database initialized successfully!' as Status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_folders FROM folders;
SELECT COUNT(*) as total_files FROM files;
SELECT COUNT(*) as total_shares FROM file_shares;
SELECT COUNT(*) as total_activities FROM activity_logs;
