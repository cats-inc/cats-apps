# Scripts

| Entry | Purpose |
|-------|---------|
| build-app.mjs | Build one immutable .catsapp with its lock and provenance; npm run package:&lt;slug&gt; |
| build-catalog.mjs | Verify catalog/apps.json against its release artifacts and sign the official catalog |
| new-catalog-key.mjs | Create the catalog signing key, store it as the CATALOG_SIGNING_KEY secret and record its public key |
| check-docs.mjs | Dependency-free workspace/documentation validation; npm run check:docs |
| windows/Sync-AgentSkills.ps1 | Bootstrap-provided skill synchronization; use only when skills are added/changed |
| windows/Remove-MergedBranches.ps1 | Explicit branch maintenance, with preview |
| linux/ and macos/ helpers | Bootstrap-provided equivalents |

Tagged App releases and catalog publication run in GitHub Actions; see the
[catalog SOP](../docs/deployment.md#official-app-catalog). No script here installs Apps
into a user profile or starts a server. new-catalog-key.mjs sets one repository secret.

Follow [script standards](../docs/SCRIPT-STANDARDS.md) for future additions.
