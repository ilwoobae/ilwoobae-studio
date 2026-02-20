-- Replace fixed types with Korean labels

DELETE FROM groups WHERE id NOT IN ('sculpture', 'non-sculpture', 'text');

INSERT OR IGNORE INTO groups (id, title) VALUES
  ('sculpture', '조각'),
  ('non-sculpture', '非조각'),
  ('text', '글');
