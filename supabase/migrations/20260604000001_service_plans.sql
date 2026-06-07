create table public.service_plans (
  id bigserial not null,
  type public.service_type not null,
  name text not null,
  subtitle text not null,
  price numeric(12, 2) not null,
  price_note text null,
  description text not null,
  tags text[] not null default '{}'::text[],
  highlighted boolean not null default false,
  is_available boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint service_plans_pkey primary key (id),
  constraint service_plans_type_key unique (type)
) TABLESPACE pg_default;

create trigger set_updated_at_service_plans
  before update on service_plans
  for each row execute function update_updated_at();
