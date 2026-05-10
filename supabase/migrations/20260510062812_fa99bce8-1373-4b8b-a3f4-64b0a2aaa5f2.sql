
-- 1) Auto-create profile trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Community groups
CREATE TABLE IF NOT EXISTS public.community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_private boolean NOT NULL DEFAULT false,
  owner_id uuid NOT NULL,
  cover text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.community_group_members (
  group_id uuid NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_group_member(_group uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_group_members WHERE group_id = _group AND user_id = _user)
$$;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO anon, authenticated;

CREATE POLICY "Groups visible by privacy"
  ON public.community_groups FOR SELECT
  USING (NOT is_private OR auth.uid() = owner_id OR public.is_group_member(id, auth.uid()));
CREATE POLICY "Auth creates group"
  ON public.community_groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner updates group"
  ON public.community_groups FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner deletes group"
  ON public.community_groups FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Members visible to members"
  ON public.community_group_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_group_member(group_id, auth.uid())
    OR auth.uid() IN (SELECT owner_id FROM public.community_groups WHERE id = group_id)
  );
CREATE POLICY "User joins group"
  ON public.community_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User leaves group"
  ON public.community_group_members FOR DELETE USING (auth.uid() = user_id);

-- 3) Posts: add group + media columns, refine SELECT policy
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES public.community_groups(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS media_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT '';

DROP POLICY IF EXISTS "Posts viewable by everyone" ON public.community_posts;
CREATE POLICY "Posts viewable by group rules"
  ON public.community_posts FOR SELECT
  USING (
    group_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.community_groups g
      WHERE g.id = group_id
        AND (NOT g.is_private OR g.owner_id = auth.uid() OR public.is_group_member(g.id, auth.uid()))
    )
  );

-- 4) Ratings (1..5)
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id uuid NOT NULL,
  rated_user_id uuid NOT NULL,
  stars int NOT NULL,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rater_id, rated_user_id)
);
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings public"
  ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Users insert own rating"
  ON public.user_ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id AND rater_id <> rated_user_id);
CREATE POLICY "Users update own rating"
  ON public.user_ratings FOR UPDATE USING (auth.uid() = rater_id);
CREATE POLICY "Users delete own rating"
  ON public.user_ratings FOR DELETE USING (auth.uid() = rater_id);

CREATE OR REPLACE FUNCTION public.validate_rating()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.stars < 1 OR NEW.stars > 5 THEN
    RAISE EXCEPTION 'stars must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_validate_rating ON public.user_ratings;
CREATE TRIGGER trg_validate_rating
  BEFORE INSERT OR UPDATE ON public.user_ratings
  FOR EACH ROW EXECUTE FUNCTION public.validate_rating();

-- 5) Storage bucket for community media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-media',
  'community-media',
  true,
  52428800,
  ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public read community media"
  ON storage.objects FOR SELECT USING (bucket_id = 'community-media');
CREATE POLICY "Auth uploads to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth updates own media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Auth deletes own media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);
