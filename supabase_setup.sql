-- Run this SQL in your Supabase SQL Editor to set up the necessary tables for the Family Hub.

-- Create a table for family photos (posts)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  image_url text not null,
  caption text,
  author_name text
);

-- Turn on Row Level Security (RLS)
alter table public.posts enable row level security;

-- Create policies

-- 1. Anyone can view posts (or you can restrict this to authenticated users only)
create policy "Anyone can view posts"
  on public.posts for select
  using ( true ); -- Change to (auth.role() = 'authenticated') for private family hub

-- 2. Authenticated users can insert their own posts
create policy "Users can insert their own posts"
  on public.posts for insert
  with check ( auth.uid() = user_id );

-- 3. Users can update their own posts
create policy "Users can update their own posts"
  on public.posts for update
  using ( auth.uid() = user_id );

-- 4. Users can delete their own posts
create policy "Users can delete their own posts"
  on public.posts for delete
  using ( auth.uid() = user_id );

-- Create a storage bucket for the photos
insert into storage.buckets (id, name, public) 
values ('family_photos', 'family_photos', true);

-- Storage policies
create policy "Anyone can view family photos"
  on storage.objects for select
  using ( bucket_id = 'family_photos' );

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check ( bucket_id = 'family_photos' and auth.role() = 'authenticated' );

-- ==========================================
-- PHASE 5: INTERACTIONS (LIKES & COMMENTS)
-- ==========================================

-- Create likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references auth.users not null,
  unique(post_id, user_id)
);

alter table public.likes enable row level security;

create policy "Anyone can view likes" on public.likes for select using (true);
create policy "Users can insert their own likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes" on public.likes for delete using (auth.uid() = user_id);

-- Create comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references auth.users not null,
  author_name text not null,
  text text not null
);

alter table public.comments enable row level security;

create policy "Anyone can view comments" on public.comments for select using (true);
create policy "Users can insert their own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = user_id);

-- Create notifications table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null, -- the user receiving the notification
  actor_name text not null, -- person who did the action
  type text not null, -- 'like' or 'comment'
  post_id uuid references public.posts on delete cascade,
  is_read boolean default false not null,
  text text -- Optional preview of comment
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Authenticated users can insert notifications" on public.notifications for insert with check (auth.role() = 'authenticated');

-- Enable real-time for likes and comments
begin;
  -- If supabase_realtime publication doesn't exist, this might fail on local setups depending on version, 
  -- but on hosted Supabase it generally exists.
  -- We drop to recreate or just add.
  alter publication supabase_realtime add table public.likes;
  alter publication supabase_realtime add table public.comments;
  alter publication supabase_realtime add table public.notifications;
commit;
