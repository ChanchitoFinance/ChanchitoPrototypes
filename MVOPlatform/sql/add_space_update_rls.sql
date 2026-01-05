-- RLS Policy: Allow space admins to update spaces
-- This policy allows users who are admins of a space to update that space

DROP POLICY IF EXISTS "Space admins can update spaces" ON enterprise_spaces;

CREATE POLICY "Space admins can update spaces" 
ON enterprise_spaces 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM space_memberships
    WHERE space_memberships.space_id = enterprise_spaces.id
    AND space_memberships.user_id = auth.uid()
    AND space_memberships.role = 'admin'
    AND space_memberships.status = 'active'
  )
);

