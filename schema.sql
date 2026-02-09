-- Run this in the Supabase SQL Editor to set up the database

-- Rounds table
create table rounds (
  id uuid default gen_random_uuid() primary key,
  date_played date not null,
  course_name text not null,
  score integer not null check (score >= 1 and score <= 199),
  notes text,
  image_url text,
  created_at timestamptz default now()
);

-- RLS policies: public read, authenticated write
alter table rounds enable row level security;

create policy "Public can read rounds"
  on rounds for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert rounds"
  on rounds for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update rounds"
  on rounds for update
  to authenticated
  using (true);

create policy "Authenticated users can delete rounds"
  on rounds for delete
  to authenticated
  using (true);

-- Courses table
create table courses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  city text,
  state text,
  created_at timestamptz default now()
);

alter table courses enable row level security;

create policy "Public can read courses"
  on courses for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert courses"
  on courses for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update courses"
  on courses for update
  to authenticated
  using (true);

create policy "Authenticated users can delete courses"
  on courses for delete
  to authenticated
  using (true);

-- Tees table
create table tees (
  id uuid default gen_random_uuid() primary key,
  course_id uuid not null references courses(id) on delete cascade,
  tee_name text not null,
  yardage integer,
  par integer,
  slope numeric,
  rating numeric,
  created_at timestamptz default now()
);

alter table tees enable row level security;

create policy "Public can read tees"
  on tees for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert tees"
  on tees for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update tees"
  on tees for update
  to authenticated
  using (true);

create policy "Authenticated users can delete tees"
  on tees for delete
  to authenticated
  using (true);

-- Add course/tee references to rounds (nullable for existing rows)
alter table rounds add column course_id uuid references courses(id);
alter table rounds add column tee_id uuid references tees(id);

-- Storage: create 'scorecards' bucket via Supabase Dashboard
-- Set it to public (public read, authenticated write)
