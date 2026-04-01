-- Dondurmaci Zeki Supabase schema (Prisma olmadan calisir)
-- SQL Editor'de tek parca calistirabilirsiniz.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

create table if not exists public."Branch" (
  "id" text primary key default gen_random_uuid()::text,
  "name" text not null,
  "slug" text not null unique,
  "shortAddress" text not null,
  "fullAddress" text not null,
  "mapUrl" text not null,
  "phone" text not null,
  "serviceNote" text not null default '',
  "isActive" boolean not null default true,
  "sortOrder" integer not null default 1,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."Menu" (
  "id" text primary key default gen_random_uuid()::text,
  "name" text not null,
  "description" text,
  "coverImageUrl" text not null default '',
  "slug" text not null unique,
  "isActive" boolean not null default true,
  "sortOrder" integer not null default 1,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."Category" (
  "id" text primary key default gen_random_uuid()::text,
  "menuId" text not null references public."Menu"("id") on delete cascade,
  "name" text not null,
  "slug" text not null,
  "description" text,
  "sortOrder" integer not null default 1,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint category_menu_slug_key unique ("menuId", "slug")
);

create table if not exists public."Product" (
  "id" text primary key default gen_random_uuid()::text,
  "categoryId" text not null references public."Category"("id") on delete cascade,
  "name" text not null,
  "slug" text not null,
  "description" text,
  "price" numeric(10, 2) not null default 0,
  "imageUrl" text not null default '',
  "isActive" boolean not null default true,
  "sortOrder" integer not null default 1,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint product_category_slug_key unique ("categoryId", "slug")
);

create table if not exists public."BranchMenu" (
  "id" text primary key default gen_random_uuid()::text,
  "branchId" text not null references public."Branch"("id") on delete cascade,
  "menuId" text not null references public."Menu"("id") on delete cascade,
  "isDefault" boolean not null default true,
  "isActive" boolean not null default true,
  "sortOrder" integer not null default 1,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint branch_menu_unique_key unique ("branchId", "menuId")
);

create table if not exists public."HomeBranchCard" (
  "id" text primary key default gen_random_uuid()::text,
  "branchId" text not null unique references public."Branch"("id") on delete cascade,
  "title" text not null,
  "shortAddress" text not null,
  "mapUrl" text not null,
  "isActive" boolean not null default true,
  "sortOrder" integer not null default 1,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."SiteSetting" (
  "id" text primary key default gen_random_uuid()::text,
  "siteName" text not null,
  "slogan" text not null default '',
  "description" text not null default '',
  "logoUrl" text not null default '',
  "backgroundImageUrl" text not null default '',
  "menuButtonText" text not null default 'Menuyu Goruntule',
  "phone" text,
  "instagramUrl" text,
  "tiktokUrl" text,
  "whatsappUrl" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."QrDesign" (
  "id" text primary key default gen_random_uuid()::text,
  "branchId" text not null references public."Branch"("id") on delete cascade,
  "menuId" text not null references public."Menu"("id") on delete cascade,
  "generatedUrl" text not null,
  "title" text not null,
  "subtitle" text,
  "showLogo" boolean not null default true,
  "showIcon" boolean not null default false,
  "backgroundColor" text not null default '#ffffff',
  "qrBackgroundColor" text not null default '#ffffff',
  "textColor" text not null default '#111111',
  "accentColor" text not null default '#111111',
  "frameThickness" integer not null default 8,
  "cornerRadius" integer not null default 12,
  "templateKey" text not null default 'classic',
  "logoUrl" text,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint qr_design_unique_key unique ("branchId", "menuId")
);

create index if not exists idx_branch_sort_order on public."Branch" ("sortOrder");
create index if not exists idx_menu_sort_order on public."Menu" ("sortOrder");
create index if not exists idx_category_menu_sort on public."Category" ("menuId", "sortOrder");
create index if not exists idx_product_category_sort on public."Product" ("categoryId", "sortOrder");
create index if not exists idx_branch_menu_sort on public."BranchMenu" ("branchId", "sortOrder");
create index if not exists idx_home_branch_card_sort on public."HomeBranchCard" ("sortOrder");
create index if not exists idx_qr_design_updated_at on public."QrDesign" ("updatedAt" desc);

drop trigger if exists set_updated_at_branch on public."Branch";
create trigger set_updated_at_branch
before update on public."Branch"
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_menu on public."Menu";
create trigger set_updated_at_menu
before update on public."Menu"
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_category on public."Category";
create trigger set_updated_at_category
before update on public."Category"
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_product on public."Product";
create trigger set_updated_at_product
before update on public."Product"
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_branch_menu on public."BranchMenu";
create trigger set_updated_at_branch_menu
before update on public."BranchMenu"
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_home_branch_card on public."HomeBranchCard";
create trigger set_updated_at_home_branch_card
before update on public."HomeBranchCard"
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_site_setting on public."SiteSetting";
create trigger set_updated_at_site_setting
before update on public."SiteSetting"
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_qr_design on public."QrDesign";
create trigger set_updated_at_qr_design
before update on public."QrDesign"
for each row execute function public.set_updated_at();

-- PostgREST cache yenile
select pg_notify('pgrst', 'reload schema');
