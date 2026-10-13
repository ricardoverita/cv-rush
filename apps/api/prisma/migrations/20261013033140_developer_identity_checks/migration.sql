-- Integrity rules that Prisma's schema language can't express (and its drift check ignores).

-- Device credentials store SHA-256 digests only.
ALTER TABLE "device_credentials" ADD CONSTRAINT "device_credentials_token_hash_sha256" CHECK (octet_length("token_hash") = 32);

-- A profile always declares between 1 and 12 technologies.
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_stack_size" CHECK ("technology_ids" IS NOT NULL AND cardinality("technology_ids") BETWEEN 1 AND 12);
