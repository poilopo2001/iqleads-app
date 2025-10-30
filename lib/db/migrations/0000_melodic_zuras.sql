CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255),
	"subscription_plan" varchar(50) DEFAULT 'free' NOT NULL,
	"subscription_status" varchar(50),
	"subscription_id" varchar(255),
	"credits_balance" integer DEFAULT 10 NOT NULL,
	"timezone" varchar(50) DEFAULT 'UTC',
	"language" varchar(10) DEFAULT 'en',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"avatar_url" varchar(500),
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"company" varchar(255),
	"source_id" uuid,
	"source_type" varchar(50),
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"lead_score" integer DEFAULT 0,
	"temperature" varchar(20) DEFAULT 'cold',
	"pre_qualification_score" integer,
	"final_qualification_score" integer,
	"ai_notes" text,
	"call_attempts" integer DEFAULT 0,
	"last_call_at" timestamp with time zone,
	"next_call_scheduled_at" timestamp with time zone,
	"custom_fields" jsonb,
	"raw_data" jsonb,
	"tags" varchar(255)[],
	"consent_to_call" boolean DEFAULT false,
	"consent_to_email" boolean DEFAULT false,
	"do_not_contact" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"converted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "call_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"lead_id" uuid,
	"call_sid" varchar(255),
	"direction" varchar(20) NOT NULL,
	"status" varchar(50) DEFAULT 'initiated' NOT NULL,
	"from_number" varchar(50),
	"to_number" varchar(50),
	"duration" integer,
	"recording_url" varchar(500),
	"recording_duration" integer,
	"transcription" text,
	"transcription_status" varchar(50),
	"ai_analysis" jsonb,
	"sentiment_score" integer,
	"qualification_score" integer,
	"key_points" varchar(255)[],
	"outcome" varchar(50),
	"notes" text,
	"next_action" text,
	"cost_credits" integer DEFAULT 1,
	"provider_data" jsonb,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"webhook_token" varchar(255) NOT NULL,
	"webhook_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"auto_qualify" boolean DEFAULT true NOT NULL,
	"auto_call" boolean DEFAULT false NOT NULL,
	"field_mapping" jsonb,
	"qualification_rule_id" uuid,
	"total_leads_received" integer DEFAULT 0,
	"last_lead_received_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lead_sources_webhook_token_unique" UNIQUE("webhook_token")
);
--> statement-breakpoint
CREATE TABLE "qualification_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"use_ai_analysis" boolean DEFAULT true NOT NULL,
	"ai_prompt_template" text,
	"call_script_template" text,
	"times_triggered" integer DEFAULT 0,
	"leads_qualified" integer DEFAULT 0,
	"leads_disqualified" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"config" jsonb NOT NULL,
	"event_filters" jsonb,
	"message_template" text,
	"last_notification_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"encrypted_api_key" text NOT NULL,
	"encrypted_api_secret" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_sources" ADD CONSTRAINT "lead_sources_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualification_rules" ADD CONSTRAINT "qualification_rules_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_credentials" ADD CONSTRAINT "organization_credentials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;