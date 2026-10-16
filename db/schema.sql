CREATE TABLE IF NOT EXISTS site_content (
  id VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  document JSON NOT NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 0,
  updated_at VARCHAR(24) CHARACTER SET ascii NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_history (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  document JSON NOT NULL,
  created_at VARCHAR(24) CHARACTER SET ascii NOT NULL,
  author VARCHAR(255) NOT NULL,
  INDEX history_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
