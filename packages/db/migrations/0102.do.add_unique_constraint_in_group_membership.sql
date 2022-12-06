-- Type: DO
-- Name: add_unique_constraint_in_group_membership
-- Description: Add unique constraint in group_membership table

BEGIN;

ALTER TABLE omnivore.group_membership ADD CONSTRAINT group_membership_unique UNIQUE (group_id, user_id);

GRANT UPDATE ON TABLE omnivore.invite TO omnivore_user;

GRANT UPDATE ON TABLE omnivore.group TO omnivore_user;

GRANT UPDATE ON TABLE omnivore.group_membership TO omnivore_user;

COMMIT;
