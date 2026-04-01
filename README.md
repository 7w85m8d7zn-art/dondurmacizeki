# Dondurmaci Zeki

## Baslatma

```bash
npm install
npm run dev
```

Uygulama: `http://localhost:3000`  
Admin giris: `http://localhost:3000/giris`

## Supabase Ayari (.env)

Gerekli degiskenler:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="<supabase-publishable-key>"
SUPABASE_SERVICE_ROLE_KEY="<supabase-service-role-key>"
AUTH_SECRET="<long-random-secret>"
NEXTAUTH_URL="http://localhost:3000" # productionda: https://alanadiniz.com
ADMIN_EMAIL="<admin-email>"
ADMIN_PASSWORD_HASH="<scrypt-hash>"
# Opsiyonel: true olursa DB baglantisi kopunca statik fallback veri gosterilir.
# DB ile birebir senkron calismak icin false birak.
ENABLE_CONTENT_FALLBACK="false"
# Opsiyonel: Uygulamayi localhost disi bir adresten aciyorsan (ornegin 172.20.x.x)
# Next.js dev CORS kontrolleri icin hostlari buraya virgul ile ekle.
# Ornek: ALLOWED_DEV_ORIGINS="172.20.10.2,192.168.1.5"
ALLOWED_DEV_ORIGINS=""
```

## Supabase SQL Kurulumu

Supabase dashboard > `SQL Editor` icinde sirasiyla:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

dosyalarini calistir.

Notlar:

- Kod, tablo adlarini `PascalCase` bekler: `Branch`, `Menu`, `Category`, `Product`, `BranchMenu`, `HomeBranchCard`, `SiteSetting`, `QrDesign`.
- SQL dosyalari `pg_notify('pgrst', 'reload schema')` ile schema cache yenilemesi tetikler.
- SQL sonrasinda lokal terminalde `npm run dev` sunucusunu yeniden baslat.
- `seed.sql` bir ilk veri dosyasidir. Her tekrar calistirdiginda silinmis ornek urunler yeniden eklenir.

## Admin Giris Bilgileri

- Email: `admin@dondurmacizeki.com`
- Sifre: `ZekiAdmin123!`

## Not

- Bu varsayilan bilgiler sadece lokal gelistirme icin uygundur.
- Production ortaminda `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` ve `AUTH_SECRET` zorunludur.

## Production Checklist

1. Hosting ortaminda tum env degiskenlerini tanimla (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `NEXTAUTH_URL=https://alanadiniz.com`).
2. Supabase SQL Editor'de `supabase/schema.sql` calismis olmali.
3. Supabase `Settings > API > Exposed schemas` icinde `public` secili olmali.
4. `ALLOWED_DEV_ORIGINS` sadece local gelistirme icindir, productionda gerekmez.
5. Deploy sonrasi `/`, `/menu-listesi`, `/giris`, `/admin/menuler` rotalarini canli ortamdan test et.
# dondurmacizeki
