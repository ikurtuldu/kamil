CREATE TABLE IF NOT EXISTS admin_login_limits (
 key_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
 attempts INT UNSIGNED NOT NULL DEFAULT 0,
 window_started_at BIGINT UNSIGNED NOT NULL,
 INDEX login_limit_expiry (window_started_at)
) ENGINE=InnoDB;
