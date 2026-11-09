# CMFI Academic Records

High school website, student learning resources, document verification and a separate staff workspace for CMFI Bilingual High School.

Website: https://simeonojong.github.io/cmfi-student-records/
Staff login: https://simeonojong.github.io/cmfi-student-records/login.html

## Current activation state

The public website and login interface are implemented. Shared authentication and verification require a configured Supabase project and an authorized staff Auth account. `config.json` deliberately has empty public connection values until the project is connected. There is no default username/password in the code. An unconfigured service fails closed and displays an activation notice rather than accepting a fake password or claiming a document is invalid.

## Pages

- `index.html`: school home page with links to dedicated pages.
- `about.html`: school introduction and values.
- `academics.html`: academic subject foundations.
- `student-life.html`: student community.
- `learning-hub.html`: expandable study guides.
- `contact.html`: school office contacts and service links.
- `verify.html`: document ID / QR-link lookup.
- `student.html?document=SCH-…`: automatically opened student and document record.
- `login.html`: staff email/password login and password reset/setup.
- `dashboard.html`: staff workspace, requiring authenticated active staff membership.

The public website uses the CMFI school seal, blue/white/brown colors, geometric sans-serif headings and graduation portraits supplied by the institution. It includes school information, academic subject groups grounded in the imported WASSCE result headings, student life, expandable study guides, contact details and document services. No unverified admissions dates, fees, exam pass rates or facilities are advertised. Staff sign-in and student verification pages use the same school branding.

## Shared records and authentication

See `database/README.md` for setup and `database/001_shared_records.sql` for the migration. The implementation uses Supabase Auth with server-side staff membership checks and database RLS. No staff password or privileged key belongs in this repository. Only the project URL and publishable/anon key are put in `config.json`.

Staff create or update students and draft documents in shared records. Saves use a database revision lock to reject stale overwrites. Existing document snapshots are immutable; their revocation status can change. Saves are recorded in an audit log. A public RPC looks up a precise document ID and returns its status, original document snapshot and associated student record. Anonymous users cannot call staff save/load endpoints or read the underlying tables directly.

New document IDs use a full random UUID. Their QR codes point directly to the student verification page. Matching draft records remain explicitly labeled drafts pending institutional approval. Verification lookup works across devices after the backend is activated.

An empty staff workspace offers an explicit import of the existing 177-student roster. Previous browser-only records can be imported from Settings without overwriting existing shared records. Source browser storage is retained as a backup.

## Existing public data

The repository contains 177 student records and 110 matched graduation portraits under the owner’s explicit authorization to publish these records to GitHub. Source PDFs, credentials and private deployment settings are excluded. Staff sign-in protects the new shared write APIs; it does not retract previously public static files or Git history.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. A web server is required for JavaScript modules and JSON. No frontend build step is needed. Internet access is needed for fonts, Supabase JS, jsPDF, QR generation and PDF.js.

## Validation

```sh
node --test tests/public.test.mjs
node --experimental-vm-modules --test tests/workspace.test.mjs
```

For database access tests, create a new disposable local PostgreSQL cluster and run, in order, `tests/auth-stubs.sql`, `database/001_shared_records.sql`, and `tests/permissions.sql` with `ON_ERROR_STOP=1`. The Auth stubs are test fixtures; do not run them against a Supabase project.

## Hosting

GitHub Pages serves the repository root from `main` and deploys updates automatically. Account billing blocked custom GitHub Actions jobs, so branch-based Pages publishing is used. Supabase provides the shared backend after activation.

## Remaining limits

PDF import supports selectable text, up to 10 MB, with a mandatory grade review. Scanned PDFs require manual entry. The system prepares draft documents, not legally signed credentials. Institution-name preferences remain local to the current browser. Production staff account lifecycle, backups and approval/signing policy must be maintained by the institution.

The refined interface uses a navy welcome section, a bold geometric school wordmark, a concise quick-access directory, quieter academic panels, desktop sticky navigation and an expandable mobile menu. Desktop and 400px mobile layouts were checked in Chrome.

Typography uses the locally hosted, open-source Outfit variable font for geometric display lettering inspired by the owner’s supplied font images, with DM Sans for readable body text. The image references are not font files; Outfit is a similar visual direction. The font license is included in `fonts/OFL-Outfit.txt`.

School navigation opens each section as an individual HTML page. Current-page indicators and breadcrumbs show the visitor’s location. Older homepage section links redirect to the corresponding page, and study-guide links open the relevant guide on the Learning Hub page.
