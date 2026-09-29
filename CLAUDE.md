# umn-cse-mto.github.io

Org-level GitHub Pages site for the `umn-cse-mto` org. It is a minimal static test site: plain `index.html`, with `.nojekyll` so GitHub skips the Jekyll build.
It deploys from branch `main` at `/` (root). There is no build step.
Default URL: https://umn-cse-mto.github.io/

## UMN custom domain hookup
Source: https://github-docs.devex.oit.umn.edu/github-pages/
1. Pick a hostname under a department subdomain (for example `<site>.cse.umn.edu`). Never touch the apex `umn.edu`.
2. Verify the domain: go to Org Settings → Pages → Verified domains → Add, and copy the TXT record.
   Email **nts-help@umn.edu** to add that TXT record for the *specific subdomain* only. Once it propagates, click Verify.
3. Email **nts-help@umn.edu** to create a **CNAME** record: `<hostname>` → `umn-cse-mto.github.io`.
4. Add a `CNAME` file at the repo root containing just the hostname. For branch deploys, this file is how the domain is set.
   Then set Repo Settings → Pages → Custom domain to the same hostname, and tick **Enforce HTTPS** once the certificate has been issued.
5. Official UMN sites must follow University Relations branding: https://university-relations.umn.edu/resources/domains-and-branding
6. Teardown: have NTS delete the CNAME *before* you remove the custom domain in Settings. Otherwise the dangling record can be used for a subdomain takeover.

Fuller UMN template (MkDocs + Actions): https://github.com/umn-devex-community/umn-pages-template
