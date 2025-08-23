ALTER TABLE "accounts" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "accounts_userId_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
