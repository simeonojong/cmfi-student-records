# CMFI Student Records

A browser-based prototype for student profiles, text-based PDF report imports, and draft transcripts, recommendations and diplomas on CMFI letterhead. Recommendation wording follows the confirmed student gender.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Use a web server rather than opening index.html directly: modules and JSON require HTTP. No build step is needed. Internet access is required for Google Fonts, jsPDF, QR generation and PDF.js.

## Included data

Two fictional demonstration students are included. Real student records, portraits, source PDFs, credentials and private deployment settings are excluded. The institutional letterhead is included.

## Workflows

- Add students and photos; review academic grades.
- Import selectable-text PDF reports up to 10 MB and correct extracted grades. Scanned PDFs require manual entry.
- Confirm gender, review personalized recommendations and generate draft PDFs.
- Generate transcripts and diplomas; register and revoke drafts.

## Prototype limitations

Student records, photos, documents and settings are saved in localStorage in each browser. They do not synchronize between coworkers or devices. A QR URL opens verification, but another browser cannot retrieve the issued document without a shared backend. Documents require institutional approval before official use.

For operational use, add staff authentication and authorization, a shared database and file storage, server-side document issuance and verification, backups and an audit trail. Publicly hosting these files does not protect records placed in the distributed JSON.

## GitHub Pages

A manual GitHub Actions workflow is provided. In Settings → Pages, choose GitHub Actions, then run Deploy static site under Actions. Availability depends on your repository visibility and GitHub plan. Hosting is not enabled automatically.

## Files

- index.html: layout and styles
- app.js: workflows and browser storage
- document-template.mjs: gender-based wording and PDF rendering
- student-roster.json: fictional example records
- cmfi-letterhead.png: institutional letterhead
