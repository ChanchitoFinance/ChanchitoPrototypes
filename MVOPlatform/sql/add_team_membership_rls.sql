-- Add RLS policy to allow users to add themselves to teams
-- This allows users to create a team and add themselves as admin
-- Run this SQL in your Supabase SQL editor

CREATE POLICY "Users can add themselves to teams" 
ON team_memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also allow users to add themselves to spaces
CREATE POLICY "Users can add themselves to spaces" 
ON space_memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
