-- migrate:up
CREATE TABLE counters (
    key   TEXT PRIMARY KEY,
    seq   BIGINT NOT NULL DEFAULT 0
);

-- migrate:down
DROP TABLE IF EXISTS counters CASCADE;
