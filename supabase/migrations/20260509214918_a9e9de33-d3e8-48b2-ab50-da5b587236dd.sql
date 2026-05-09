
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kq',
  stock integer NOT NULL DEFAULT 0,
  region text NOT NULL DEFAULT '',
  seller text NOT NULL DEFAULT '',
  rating numeric NOT NULL DEFAULT 0,
  bnpl boolean NOT NULL DEFAULT false,
  organic boolean NOT NULL DEFAULT false,
  image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Users insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update products" ON public.products FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete products" ON public.products FOR DELETE USING (auth.uid() = owner_id);
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  year integer NOT NULL DEFAULT 2020,
  type text NOT NULL DEFAULT 'Traktor',
  status text NOT NULL DEFAULT 'AVAILABLE',
  price_per_hour numeric NOT NULL DEFAULT 0,
  price_per_day numeric NOT NULL DEFAULT 0,
  region text NOT NULL DEFAULT '',
  district text NOT NULL DEFAULT '',
  power_kw integer NOT NULL DEFAULT 0,
  fuel text NOT NULL DEFAULT 'Dizel',
  insured boolean NOT NULL DEFAULT false,
  image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipment viewable by everyone" ON public.equipment FOR SELECT USING (true);
CREATE POLICY "Users insert own equipment" ON public.equipment FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update equipment" ON public.equipment FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners delete equipment" ON public.equipment FOR DELETE USING (auth.uid() = owner_id);
CREATE TRIGGER equipment_updated BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Ümumi',
  image text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts viewable by everyone" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users insert own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors update posts" ON public.community_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors delete posts" ON public.community_posts FOR DELETE USING (auth.uid() = author_id);
CREATE TRIGGER community_posts_updated BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by everyone" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Users insert own comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors delete comments" ON public.community_comments FOR DELETE USING (auth.uid() = author_id);
