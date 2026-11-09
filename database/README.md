# Shared records setup

1. Connect the school’s Supabase project. Apply `001_shared_records.sql` once as a migration.
2. Disable public account signup. Create the initial staff Auth account for the school administrator’s confirmed email address using the Supabase Auth admin API or dashboard. Set a strong temporary password privately or use a secure account-setup link. Never commit a password or service-role key.
3. Add the created Auth user ID to `public.cmfi_staff` with role `admin`. No user can grant themselves a staff role from the website.
4. Configure the production Site URL and allowed auth redirect URL as `https://simeonojong.github.io/cmfi-student-records/login.html`.
5. Put only the Supabase project URL and publishable/anon key in `config.json`. The public key is protected by database permissions, RLS and staff membership checks; it is not a staff credential.
6. Sign in and use the workspace’s initial roster import. The current 177 records remain in `student-roster.json`. Existing browser-only edits and documents can be imported using the explicit legacy-browser import, after review.

Staff endpoints check active server-side membership. Public visitors can only call `cmfi_verify_document` for a document ID. A successful lookup returns its immutable document snapshot, its current revocation status and the associated student record. Drafts are labeled drafts, not official attestations. Records are not deleted by a partial import. Saves use a global revision lock so stale clients cannot overwrite colleagues’ changes.

This migration has no default password and does not make an account automatically. A login page alone is not authentication. Until a project and staff account are provisioned, the pages clearly report that activation is pending.

Previously published student files and photos remain public in this repository and its history under the owner’s earlier authorization. Staff sign-in protects the new shared write APIs; it does not retract already public GitHub files.
