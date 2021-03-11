
CREATE TABLE identifier (
  id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  random_key text
);

CREATE TABLE requests (
  id int GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  headers jsonb,
  random_key_id int REFERENCES identifier (id),
  body jsonb,
  date_created timestamp NOT NULL DEFAULT NOW()
);