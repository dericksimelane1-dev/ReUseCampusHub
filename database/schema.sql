CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE,
  name TEXT,
  email TEXT,
  eco_points INTEGER DEFAULT 0
);

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT,
  description TEXT,
  category TEXT,
  image_url TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  content TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exchanges (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id),
  requester_id INTEGER REFERENCES users(id),
  status TEXT,
  exchanged_at TIMESTAMP
);