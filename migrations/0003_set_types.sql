-- Replace fixed types with artwork + text

DELETE FROM groups WHERE id NOT IN ('artwork','text');

INSERT OR IGNORE INTO groups (id, title) VALUES
  ('artwork', 'Artwork'),
  ('text', 'Text');
