-- SQL Script: Create Session Table
-- Run this in MySQL directly (via phpMyAdmin or mysql CLI)
-- This is the ONLY table that needs to be created (AdminUser already exists)

USE church_db;  -- Change to your database name

CREATE TABLE IF NOT EXISTS Session (
    id VARCHAR(128) PRIMARY KEY,                    -- Cryptographically secure session ID
    adminId INT NOT NULL,                           -- References AdminUser.id
    expiresAt DATETIME NOT NULL,                    -- Session expiration time (UTC)
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,   -- When session was created
    INDEX idx_admin_id (adminId),                   -- Fast lookups by admin
    INDEX idx_expiresAt (expiresAt),                -- Fast cleanup of expired sessions
    FOREIGN KEY (adminId) REFERENCES AdminUser(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Optional: Add a trigger to auto-cleanup expired sessions on INSERT
DELIMITER //
CREATE TRIGGER cleanup_expired_sessions_before_insert
BEFORE INSERT ON Session
FOR EACH ROW
BEGIN
    DELETE FROM Session WHERE expiresAt < UTC_TIMESTAMP();
END//
DELIMITER ;

-- Verify table creation
SHOW TABLES LIKE 'Session';
DESCRIBE Session;

-- Example: Create a session (for testing)
-- INSERT INTO Session (id, adminId, expiresAt)
-- VALUES (
--     'test_session_id_1234567890123456789012345678901234567890',
--     1,
--     DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY)
-- );

-- Example: Check active sessions
-- SELECT s.id, s.expiresAt, a.username, a.email
-- FROM Session s
-- JOIN AdminUser a ON a.id = s.adminId
-- WHERE s.expiresAt > UTC_TIMESTAMP();

-- Example: Delete expired sessions
-- DELETE FROM Session WHERE expiresAt < UTC_TIMESTAMP();
