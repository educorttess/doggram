-- ============================================================
-- Doggram — Follow count triggers
-- Keeps following_count / followers_count in sync automatically
-- ============================================================

-- Increment counts on follow
CREATE OR REPLACE FUNCTION handle_follow_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  RETURN NEW;
END;
$$;

-- Decrement counts on unfollow (floor at 0 to avoid negatives from drift)
CREATE OR REPLACE FUNCTION handle_follow_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trigger_follow_insert ON follows;
CREATE TRIGGER trigger_follow_insert
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION handle_follow_insert();

DROP TRIGGER IF EXISTS trigger_follow_delete ON follows;
CREATE TRIGGER trigger_follow_delete
  AFTER DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION handle_follow_delete();

-- Resync any existing drift
UPDATE profiles p
SET
  following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = p.id),
  followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = p.id);
