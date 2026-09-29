# Service Registry

cats-apps currently starts no listening service and reserves no ports.

Installed utility renderers are hosted by cats-platform. Provider and quota
collection belongs to cats-runtime. Development-server ports must be registered
here when an actual development server is introduced; none is configured yet.

| Related service | Default port | Ownership |
|-----------------|--------------|-----------|
| Platform HTTP host | 8181 | cats-platform |
| Platform renderer development server | 5173 | cats-platform |
| Runtime HTTP service | 3110 | cats-runtime |

These references do not start those services or authorize changes to their config.

Planned Ask services are App-owned components delivered with their frontends in
one package. Desktop will allocate/supervise listeners and configured external
ingress under the App lifecycle. Users do not install or launch a separate Ask
backend. No service port is assigned by this documentation change; register
actual listeners when implementing Platform SPEC-122 and Ask PLAN-005.

*Last updated: 2026-09-29*
