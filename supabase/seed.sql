-- Dondurmaci Zeki ilk veri seti
-- schema.sql calistiktan sonra calistirin.

insert into public."Branch" (
  "id",
  "name",
  "slug",
  "shortAddress",
  "fullAddress",
  "mapUrl",
  "phone",
  "serviceNote",
  "isActive",
  "sortOrder"
)
values (
  'branch-karakopru',
  'Karakopru Subesi',
  'menu-listesi',
  'Diyarbakir Yolu Cad. No:45, Karakopru',
  'Diyarbakir Yolu Cad. No:45, Karakopru / Sanliurfa',
  'https://maps.google.com/?q=Sanliurfa+Karakopru+Diyarbakir+Yolu+45',
  '+90 414 000 00 02',
  'Aile boyu servisler ve ferah kup secenekleri',
  true,
  1
)
on conflict ("id") do update
set
  "name" = excluded."name",
  "slug" = excluded."slug",
  "shortAddress" = excluded."shortAddress",
  "fullAddress" = excluded."fullAddress",
  "mapUrl" = excluded."mapUrl",
  "phone" = excluded."phone",
  "serviceNote" = excluded."serviceNote",
  "isActive" = excluded."isActive",
  "sortOrder" = excluded."sortOrder";

insert into public."Menu" (
  "id",
  "name",
  "description",
  "coverImageUrl",
  "slug",
  "isActive",
  "sortOrder"
)
values (
  'menu-karakopru',
  'Karakopru Menusu',
  'Aile boyu servisler, kup dondurmalar ve tatli eslikleriyle hazirlanan sube menusu.',
  'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=1200&q=80',
  'karakopru-menusu',
  true,
  1
)
on conflict ("id") do update
set
  "name" = excluded."name",
  "description" = excluded."description",
  "coverImageUrl" = excluded."coverImageUrl",
  "slug" = excluded."slug",
  "isActive" = excluded."isActive",
  "sortOrder" = excluded."sortOrder";

insert into public."BranchMenu" (
  "id",
  "branchId",
  "menuId",
  "isDefault",
  "isActive",
  "sortOrder"
)
values (
  'branch-menu-karakopru',
  'branch-karakopru',
  'menu-karakopru',
  true,
  true,
  1
)
on conflict ("branchId", "menuId") do update
set
  "isDefault" = excluded."isDefault",
  "isActive" = excluded."isActive",
  "sortOrder" = excluded."sortOrder";

insert into public."Category" (
  "id",
  "menuId",
  "name",
  "slug",
  "description",
  "sortOrder",
  "isActive"
)
values
  (
    'karakopru-dondurmalar',
    'menu-karakopru',
    'Dondurmalar',
    'dondurmalar',
    'Kaymakli ve meyveli dondurma secenekleri.',
    1,
    true
  ),
  (
    'karakopru-kunefeler',
    'menu-karakopru',
    'Kunefeler',
    'kunefeler',
    'Paylasima uygun sicak tatli secenekleri.',
    2,
    true
  ),
  (
    'karakopru-sutlu-tatlilar',
    'menu-karakopru',
    'Sutlu Tatlilar',
    'sutlu-tatlilar',
    'Serin servis edilen hafif tatlilar.',
    3,
    true
  ),
  (
    'karakopru-icecekler',
    'menu-karakopru',
    'Icecekler',
    'icecekler',
    'Serinletici ve menuyu tamamlayan icecek secenekleri.',
    4,
    true
  )
on conflict ("id") do update
set
  "menuId" = excluded."menuId",
  "name" = excluded."name",
  "slug" = excluded."slug",
  "description" = excluded."description",
  "sortOrder" = excluded."sortOrder",
  "isActive" = excluded."isActive";

insert into public."Product" (
  "id",
  "categoryId",
  "name",
  "slug",
  "description",
  "price",
  "imageUrl",
  "isActive",
  "sortOrder"
)
values
  (
    'karakopru-kaymakli-dondurma',
    'karakopru-dondurmalar',
    'Kaymakli Dondurma',
    'kaymakli-dondurma',
    'Kaymak aromasi belirgin, yumusak dokulu secim.',
    105,
    'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=1200&q=80',
    true,
    1
  ),
  (
    'karakopru-meyveli-kup',
    'karakopru-dondurmalar',
    'Meyveli Kup Dondurma',
    'meyveli-kup-dondurma',
    'Cilek, muz ve cikolata sosla katmanli sunum.',
    145,
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1200&q=80',
    true,
    2
  ),
  (
    'karakopru-ozel-kunefe',
    'karakopru-kunefeler',
    'Ozel Kunefe Tabagi',
    'ozel-kunefe-tabagi',
    'Bol fistikli ve dondurma eslikli premium tabak.',
    150,
    'https://images.unsplash.com/photo-1617196039897-fc7dcad7d0b9?auto=format&fit=crop&w=1200&q=80',
    true,
    1
  ),
  (
    'karakopru-cifte-peynirli-kunefe',
    'karakopru-kunefeler',
    'Cifte Peynirli Kunefe',
    'cifte-peynirli-kunefe',
    'Daha yogun peynir dokulu sicak servis.',
    160,
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=1200&q=80',
    true,
    2
  ),
  (
    'karakopru-supangle',
    'karakopru-sutlu-tatlilar',
    'Supangle',
    'supangle',
    'Yogun kakao dokulu serin sutlu tatli.',
    92,
    'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=1200&q=80',
    true,
    1
  ),
  (
    'karakopru-profiterol',
    'karakopru-sutlu-tatlilar',
    'Profiterol Kase',
    'profiterol-kase',
    'Mini hamur toplari ve akiskan cikolata sos ile servis.',
    98,
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80',
    true,
    2
  ),
  (
    'karakopru-naneli-ayran',
    'karakopru-icecekler',
    'Naneli Ayran',
    'naneli-ayran',
    'Ferahlatici nane dokunusuyla geleneksel ayran.',
    55,
    'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?auto=format&fit=crop&w=1200&q=80',
    true,
    1
  ),
  (
    'karakopru-soda-limon',
    'karakopru-icecekler',
    'Soda Limon',
    'soda-limon',
    'Hafif ve ferah bir eslikci secenek.',
    45,
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
    true,
    2
  )
on conflict ("id") do update
set
  "categoryId" = excluded."categoryId",
  "name" = excluded."name",
  "slug" = excluded."slug",
  "description" = excluded."description",
  "price" = excluded."price",
  "imageUrl" = excluded."imageUrl",
  "isActive" = excluded."isActive",
  "sortOrder" = excluded."sortOrder";

insert into public."SiteSetting" (
  "id",
  "siteName",
  "slogan",
  "description",
  "logoUrl",
  "backgroundImageUrl",
  "menuButtonText",
  "phone",
  "instagramUrl",
  "tiktokUrl",
  "whatsappUrl"
)
values (
  'site-setting-default',
  'Dondurmacı Zeki',
  'Nereden geliyorsun? DONDURMACI ZEKI''den. Nereye gidiyorsun? DONDURMACI ZEKI''ye.',
  'Subeni sec, konumu gor ve menuyu tek dokunusla incele.',
  '',
  'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=1600&q=80',
  'Menuyu Goruntule',
  '0533 792 02 42',
  'https://instagram.com/dondurmacizeki',
  'https://tiktok.com/@dondurmac.zeki.kar',
  'https://wa.me/05537920242'
)
on conflict ("id") do update
set
  "siteName" = excluded."siteName",
  "slogan" = excluded."slogan",
  "description" = excluded."description",
  "logoUrl" = excluded."logoUrl",
  "backgroundImageUrl" = excluded."backgroundImageUrl",
  "menuButtonText" = excluded."menuButtonText",
  "phone" = excluded."phone",
  "instagramUrl" = excluded."instagramUrl",
  "tiktokUrl" = excluded."tiktokUrl",
  "whatsappUrl" = excluded."whatsappUrl";

insert into public."HomeBranchCard" (
  "id",
  "branchId",
  "title",
  "shortAddress",
  "mapUrl",
  "isActive",
  "sortOrder"
)
values (
  'home-card-branch-karakopru',
  'branch-karakopru',
  'Karakopru Subesi',
  'Diyarbakir Yolu Cad. No:45, Karakopru',
  'https://maps.google.com/?q=Sanliurfa+Karakopru+Diyarbakir+Yolu+45',
  true,
  1
)
on conflict ("branchId") do update
set
  "title" = excluded."title",
  "shortAddress" = excluded."shortAddress",
  "mapUrl" = excluded."mapUrl",
  "isActive" = excluded."isActive",
  "sortOrder" = excluded."sortOrder";

select pg_notify('pgrst', 'reload schema');
