# MCP Boundary

cats-apps does not start an MCP server or require a coding-agent MCP configuration.
Usage reads telemetry through the platform App bridge.

Connector tools and runtime-backed operations, if introduced by a later app,
must use the platform-owned tool boundary and cats-runtime. They do not belong
in the dashboard renderer or in repository bootstrap scripts.

*Last updated: 2026-09-10*
