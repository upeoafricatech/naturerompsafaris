alter table public.tours
  add column if not exists catalog_group text;

alter table public.tours
  drop constraint if exists tours_catalog_group_check;

alter table public.tours
  add constraint tours_catalog_group_check
  check (
    catalog_group is null
    or catalog_group in (
      'kenya-lodges',
      'kenya-tanzania-lodges',
      'tanzania-lodges',
      'kenya-tanzania-group-joining',
      'kenya-group-joining',
      'coast-safaris',
      'mount-kenya',
      'kilimanjaro'
    )
  );

create index if not exists tours_catalog_group_idx
  on public.tours (catalog_group);

update public.tours
set catalog_group = 'kenya-tanzania-group-joining'
where id = 'd7091c8e-d0e0-46e9-ab8e-140a6d302876'
  and catalog_group is null;
