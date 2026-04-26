# ACHIMOTA NSMQ APP

React Native (Expo) app for NSMQ practice, announcements, shared entries, leaderboard, and student progress tracking.

## Run The App

1. Install dependencies:
	npm install
2. Start Expo:
	npm start

## Supabase Setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run:
	supabase/schema.sql
3. In Supabase Auth settings, enable Email provider.
4. For testing, you can disable email confirmation so new users can sign in immediately.
5. Copy .env.example to .env and set:
	EXPO_PUBLIC_SUPABASE_URL
	EXPO_PUBLIC_SUPABASE_ANON_KEY
6. Restart Expo after saving .env.

## Synced Modules

- Entry Hub reads/writes from public.entry_posts.
- Leaderboard reads from public.leaderboard_scores.
- Entry creation requires signed-in Supabase users and stores user_id with each post.

If env variables are missing or Supabase is unreachable, the app gracefully falls back to local in-memory data.

## Useful Commands

- npm start
- npm run android
- npm run ios
- npm run web
- npm run lint
