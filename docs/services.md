# Service Registry

Released Apps in this checkout start no listening service and reserve no ports.

Installed utility renderers are hosted by cats-platform. Provider and quota
collection belongs to cats-runtime. Development-server ports must be registered
here when an actual development server is introduced; none is configured yet.

| Related service | Default port | Ownership |
|-----------------|--------------|-----------|
| Platform HTTP host | 8181 | cats-platform |
| Platform renderer development server | 5173 | cats-platform |
| Runtime HTTP service | 3110 | cats-runtime |

These references do not start those services or authorize changes to their config.

Ask's unpublished prototype has App-owned services and private dynamic loopback
listeners supervised by Desktop. The required next design shares Platform's
single public origin/port/tunnel with Mobile and every App; `/apps/cats.ask/api/`
and `/apps/cats.ask/mcp` route to Ask's internal service. No additional public App
port or tunnel is reserved. App lifecycle controls its components/routes; Platform
controls the common ingress. Shared routing is not implemented. Users install
one Ask package; this document starts no listener or changes any user settings.

*Last updated: 2026-09-29*
