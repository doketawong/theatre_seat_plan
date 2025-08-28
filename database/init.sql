-- Theatre Seat Plan Database Initialization

-- Create database if not exists (handled by docker-compose)
-- CREATE DATABASE IF NOT EXISTS moviematic;

-- Create tables for the application
CREATE TABLE IF NOT EXISTS review (
    id SERIAL PRIMARY KEY,
    movie_name VARCHAR(255),
    reviewer_name VARCHAR(255),
    rating INTEGER,
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS private_cinema (
    id SERIAL PRIMARY KEY,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    seating_plan JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    instagram_handle VARCHAR(100),
    seat_assignment VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO review (movie_name, reviewer_name, rating, review_text) 
VALUES 
    ('Sample Movie', 'John Doe', 5, 'Great movie experience!'),
    ('Another Film', 'Jane Smith', 4, 'Really enjoyed it')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_instagram ON participants(instagram_handle);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
