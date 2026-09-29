# App Security and State Boundaries

## Usage

- Request only the scoped host telemetry read capability needed by the dashboard.
- Never ship provider credentials, login files, API keys, or runtime authentication
  tokens in the renderer or app package.
- Consume sanitized account aliases and normalized observations. Raw provider
  output and unrelated host/user state remain outside the app contract.
- Display unavailable, stale, estimated, and partial coverage explicitly.
- A dashboard read does not authorize CLI execution, account login, or a paid probe.

## Package and Host Ownership

Ask shared ingress is planned under Platform SPEC-122. URL prefixes do not
isolate browser origins: require an opaque sandbox, scoped App/owner/generation
view grants for ordinary fetch and distinct MCP connection/attempt credentials.
No Platform cookies or tunnel/provider secrets go to the App; MCP tokens cannot
read private App APIs or another App. Ingress changes retain questions/receipts
and never silently resend. Revalidate Copy and direct navigation in the actual
shared-origin sandbox before declaring acceptance.

The host enforces trust, compatibility, permissions, activation, and lifecycle.
A package cannot gain system trust merely by declaring it in its own manifest.
Exact package contents and entrypoints must be validated before activation.
Detailed install/renderer protections are owned by platform SPEC-115.

Tests use temporary profiles and fixtures. App data remains separate from
replaceable versioned package contents. No app is installed into the user's live
profile by repository checks.

*Last updated: 2026-09-10*
