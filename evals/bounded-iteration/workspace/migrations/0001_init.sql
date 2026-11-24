CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE users (
  id uuid NOT NULL DEFAULT uuidv7(),
  email text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uq_users__email UNIQUE (email)
);

CREATE TRIGGER users_touch BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE profiles (
  id uuid NOT NULL DEFAULT uuidv7(),
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  bio text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pk_profiles PRIMARY KEY (id),
  CONSTRAINT fk_profiles__user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TRIGGER profiles_touch BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
