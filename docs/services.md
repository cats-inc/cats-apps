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

*Last updated: 2026-09-10*
