-- PM Interview Prep Assistant — Supabase schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

create table prep_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  content text not null,
  tags text[],
  created_at timestamptz default now()
);

-- A few starter entries so the app isn't empty on first run.
insert into prep_documents (title, category, content, tags) values
('RICE prioritization framework', 'Frameworks', 'RICE stands for Reach, Impact, Confidence, and Effort. Score each feature on these four factors, then calculate: (Reach x Impact x Confidence) / Effort. Higher scores indicate higher priority. Reach = how many users/events per time period. Impact = how much it moves the needle (use a scale like 3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal). Confidence = how sure you are (100%=high, 80%=medium, 50%=low). Effort = person-months required.', ARRAY['prioritization', 'frameworks']),
('Product sense: designing for a new market', 'Product Sense', 'When asked to design a product for a new market or user segment, structure your answer as: 1) Clarify the goal and constraints (who, why now, what does success look like). 2) Identify the user and their core problem — avoid assuming your own context applies. 3) Brainstorm 2-3 directions, pick one with a clear rationale. 4) Define an MVP scope with a testable hypothesis. 5) State how you would measure success and what you would iterate on next.', ARRAY['product sense', 'frameworks']),
('Metrics: North Star metric selection', 'Metrics', 'A North Star metric should capture the core value a product delivers to users, correlate with long-term business success, and be something the team can influence. Common mistake: picking a vanity metric (e.g. total signups) instead of one tied to actual value delivery (e.g. weekly active users completing a core action). Pair it with a small set of input metrics that the team can directly move.', ARRAY['metrics']),
('Behavioral: describe a time you disagreed with a stakeholder', 'Behavioral', 'Structure using STAR (Situation, Task, Action, Result). Focus on how you gathered data or user evidence to make your case, not just persuasion. Good answers show you took the disagreement seriously, sought to understand the other perspective, and reached a resolution grounded in shared goals rather than "winning." End with what you would do differently, if relevant — this signals reflection rather than defensiveness.', ARRAY['behavioral']);
