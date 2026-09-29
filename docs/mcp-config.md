# MCP Boundary

cats-apps does not start an MCP server or require a coding-agent MCP configuration.
Usage reads telemetry through the platform App bridge.

Ask will own its question/answer MCP inside its App backend, packaged and managed
with its frontends as one `cats.ask` installation. Platform supplies component
hosting, endpoint publication and lifecycle; it does not define Ask's domain
tools. Only actual Runtime-backed execution uses Runtime capabilities.

An external client reaches a declared, authenticated Ask endpoint. App frontends
use Ask's private HTTP API directly; neither path requires adding Ask tools to
Runtime's existing MCP. Public ingress belongs to Platform and is shared with
Platform/Mobile and all Apps. Ask's `/apps/cats.ask/mcp` has its own connection/
attempt credentials; private APIs need separate view grants. Removing Ask revokes
its routes, not the shared tunnel. Tutorial shows host setup/status and connector
instructions without collecting tunnel credentials. A local package prototype
passed Windows fixtures; shared ingress and live candidate Bot are pending under
Platform SPEC-122. No separate backend App installation is required.

*Last updated: 2026-09-29*
