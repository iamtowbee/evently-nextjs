-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the flow_state table
CREATE TABLE IF NOT EXISTS auth.flow_state (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users,
    auth_code text,
    code_challenge_method text,
    code_challenge text,
    provider_type text,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    authentication_method text
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS flow_state_user_id_idx ON auth.flow_state(user_id);

-- Create the audit_log_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamptz,
    ip_address varchar(64) DEFAULT NULL::character varying,
    CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id)
);

-- Create the identities table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.identities (
    id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    CONSTRAINT identities_pkey PRIMARY KEY (provider, id),
    CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities(user_id);

-- Create the instances table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamptz,
    updated_at timestamptz,
    CONSTRAINT instances_pkey PRIMARY KEY (id)
);

-- Create the refresh_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    instance_id uuid,
    id bigserial PRIMARY KEY,
    token text,
    user_id uuid,
    revoked boolean,
    created_at timestamptz,
    updated_at timestamptz,
    parent text,
    session_id uuid
);

-- Create index on token
CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON auth.refresh_tokens(token);
-- Create index on user_id
CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON auth.refresh_tokens(user_id);
-- Create index on session_id
CREATE INDEX IF NOT EXISTS refresh_tokens_session_id_idx ON auth.refresh_tokens(session_id);

-- Create the schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.schema_migrations (
    version text NOT NULL,
    CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);

-- Create the sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid NOT NULL,
    user_id uuid,
    created_at timestamptz,
    updated_at timestamptz,
    factor_id uuid,
    aal aal_level,
    not_after timestamptz,
    refreshed_at timestamptz,
    user_agent text,
    ip text,
    tag text,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON auth.sessions(user_id);
-- Create index on not_after
CREATE INDEX IF NOT EXISTS sessions_not_after_idx ON auth.sessions(not_after DESC);
-- Create index on factor_id
CREATE INDEX IF NOT EXISTS sessions_factor_id_idx ON auth.sessions(factor_id);

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud varchar(255),
    role varchar(255),
    email varchar(255),
    encrypted_password varchar(255),
    email_confirmed_at timestamptz,
    invited_at timestamptz,
    confirmation_token varchar(255),
    confirmation_sent_at timestamptz,
    recovery_token varchar(255),
    recovery_sent_at timestamptz,
    email_change_token_new varchar(255),
    email_change varchar(255),
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamptz,
    updated_at timestamptz,
    phone varchar(15) DEFAULT NULL::character varying,
    phone_confirmed_at timestamptz,
    phone_change varchar(15) DEFAULT ''::character varying,
    phone_change_token varchar(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamptz,
    confirmed_at timestamptz,
    email_change_token_current varchar(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamptz,
    reauthentication_token varchar(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamptz,
    is_sso_user boolean DEFAULT false,
    deleted_at timestamptz,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_phone_key UNIQUE (phone)
);

-- Create index on instance_id
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users(instance_id);

-- Create the mfa_amr_claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    CONSTRAINT mfa_amr_claims_pkey PRIMARY KEY (id),
    CONSTRAINT mfa_amr_claims_session_id_authentication_method_key UNIQUE (session_id, authentication_method),
    CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE
);

-- Create the mfa_factors table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.mfa_factors (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type factor_type NOT NULL,
    status factor_status NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    secret text,
    CONSTRAINT mfa_factors_pkey PRIMARY KEY (id),
    CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create the mfa_challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.mfa_challenges (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    factor_id uuid NOT NULL,
    created_at timestamptz NOT NULL,
    verified_at timestamptz,
    ip_address inet,
    CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id),
    CONSTRAINT mfa_challenges_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE
);

-- Create the sso_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.sso_providers (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    resource_id text,
    created_at timestamptz,
    updated_at timestamptz,
    CONSTRAINT sso_providers_pkey PRIMARY KEY (id)
);

-- Create the sso_domains table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.sso_domains (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    sso_provider_id uuid,
    domain text,
    created_at timestamptz,
    updated_at timestamptz,
    CONSTRAINT sso_domains_pkey PRIMARY KEY (id),
    CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE
);

-- Create the saml_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.saml_providers (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    sso_provider_id uuid,
    entity_id text,
    metadata_xml text,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamptz,
    updated_at timestamptz,
    CONSTRAINT saml_providers_pkey PRIMARY KEY (id),
    CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE
);

-- Create the saml_relay_states table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.saml_relay_states (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    sso_provider_id uuid,
    request_id text,
    for_email text,
    redirect_to text,
    from_ip_address inet,
    created_at timestamptz,
    updated_at timestamptz,
    CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id),
    CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE
);

-- Create necessary enums if they don't exist
DO $$ BEGIN
    CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create RLS policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data." ON auth.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data." ON auth.users
    FOR UPDATE USING (auth.uid() = id);

-- Add any additional policies you need here 