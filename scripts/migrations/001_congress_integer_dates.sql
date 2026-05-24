-- Migration 001: congress columns text→integer, date columns text→date, terms text→integer
-- Run on the server BEFORE deploying the updated application code.
-- Uses ::timestamptz::date to safely handle both plain "YYYY-MM-DD" and ISO 8601 timestamp strings.

ALTER TABLE federal_bills ALTER COLUMN congress TYPE integer USING NULLIF(congress, '')::integer;
ALTER TABLE federal_member_bill_roles ALTER COLUMN congress TYPE integer USING NULLIF(congress, '')::integer;
ALTER TABLE federal_member_bill_cache_status ALTER COLUMN congress TYPE integer USING NULLIF(congress, '')::integer;

ALTER TABLE federal_bills ALTER COLUMN introduced_date TYPE date USING NULLIF(introduced_date, '')::timestamptz::date;
ALTER TABLE federal_bills ALTER COLUMN latest_action_date TYPE date USING NULLIF(latest_action_date, '')::timestamptz::date;
ALTER TABLE federal_bills ALTER COLUMN update_date TYPE date USING NULLIF(update_date, '')::timestamptz::date;
ALTER TABLE state_bills ALTER COLUMN introduced_date TYPE date USING NULLIF(introduced_date, '')::timestamptz::date;

ALTER TABLE federal_members ALTER COLUMN terms TYPE integer USING NULLIF(terms, '')::integer;
