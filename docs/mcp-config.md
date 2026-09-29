# MCP Boundary

cats-apps does not start an MCP server or require a coding-agent MCP configuration.
Usage reads telemetry through the platform App bridge.

Ask will own its question/answer MCP inside its App backend, packaged and managed
with its frontends as one `cats.ask` installation. Platform supplies component
hosting, endpoint publication and lifecycle; it does not define Ask's domain
tools. Only actual Runtime-backed execution uses Runtime capabilities.

An external client reaches a declared, authenticated Ask endpoint. App frontends
use Ask's private HTTP API directly; neither path requires adding Ask tools to
Runtime's existing MCP. Public ingress configuration belongs to the App's setup
and lifecycle, with no separate backend App installation. The completed standalone
probe is evidence; packaged App hosting remains planned under Platform SPEC-122.

*Last updated: 2026-09-29*
