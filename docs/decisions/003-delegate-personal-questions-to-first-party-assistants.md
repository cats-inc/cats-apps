# ADR-003: Delegate Personal Questions to First-party Assistants

## Status

MVP scope, complete-App ownership and shared Platform ingress accepted —
2026-09-29. Grok Bot assisted MCP/bookmark retrieval passed a standalone probe.
An unpublished `cats.ask` 0.1.0 candidate passed isolated Windows installed-package
fixtures; shared ingress, a live candidate Bot round trip and other providers
remain pending. No release is declared.

## Context

2026-09-29 architecture correction: the user requires each App to own multiple
frontends and backends as one install/update/management unit. App-owned API
requests use normal web protocols, without Platform SDK business-method wrappers.
The former Runtime-owned Ask delegation/storage proposal below is replaced by
App-owned services under [Platform ADR-125](https://github.com/cats-inc/cats-platform/blob/main/docs/decisions/125-own-multiple-frontends-and-backends-in-one-app.md).
That decision now also requires one public origin/port/tunnel for Platform,
Mobile and all Apps. The local per-App ingress prototype must be revised.

The user wants the personalized understanding and recommendations that Gemini Spark already
has, plus the content that Grok Bot and Meta AI obtain under the user's identity and connector
authorization. The user has tested these capabilities in the original products; a later Grok
Bot bookmark probe passed; real Bot round trips for Spark, Meta and the formal candidate
package are not yet verified. Data APIs, public post search and same-brand model APIs
cannot prove access to the same personal context. Grok web and Grok Bot must be
identified separately.

A current Cats App can switch between a list and a detail view inside a single sandboxed
HTML document. The executable SDK 1.3 provides Usage, image work and return to the Lobby;
it has no Ask task or text clipboard interface. The existence of general
storage/action/navigation types does not mean they are implemented. The inspection baseline
and official entry-point data are recorded in the
[feasibility baseline](../research/2026-09-29-personal-assistant-delegation-baseline.md).

## Decision

1. Plan a standalone Cats App **Ask**, with working package ID `cats.ask` and source slug
   `ask`. The MVP flow is: choose a personal assistant → ask a question → view status/answer →
   press a small copy button.
2. The delegation target is a specific product, user connection and assistant environment.
   Gemini Spark, Grok Bot and Meta AI are verified separately; Grok web, the Grok Build CLI
   or a general model API must not be treated as a Grok Bot fallback. If Meta Muse becomes a
   candidate, record its product entry point and verification separately; it does not
   automatically inherit Meta AI capabilities.
3. Use asynchronous task semantics; fast replies can be shown immediately. External execution
   starting must have observable evidence; queued, waiting for the assistant, needing user
   action and result unconfirmed must not be conflated as "querying".
4. Prefer verifying a formal delegation entry point, or having the external assistant claim
   questions and return results through a restricted connector. MCP is a candidate transport;
   it does not imply wake-up capability, that it can be used together with private-data tools,
   or that results can be returned without approval. Triggering, query capability and return
   are three contracts that each must pass.
5. The Ask frontend calls the same App's backend through ordinary HTTP/streaming. Ask itself
   owns the question API, Q&A data, external assistant adapters, MCP claim/return and receipts.
   Platform provides the generic App sandbox, routing, identity isolation and process
   lifecycle; the SDK is used for host capabilities such as the clipboard. Runtime provides
   only the shared execution capabilities actually needed; this Bot claim/return route need
   not pass through it. One `cats.ask` package can contain multiple frontends/backends, and the
   user installs, updates and manages only one App.
6. The Q&A lifecycle is held by a background service. Leaving the App and reopening it shows
   the same state; when only the local host is down, receiving replies is not promised. How a
   cloud reply is retained, resent and recovered after restart must be proven by the selected
   transport.
7. Save the request identity before sending; local retries and reply receipt for the same
   request must be deduplicated. When the external side lacks deduplication or receipt lookup,
   an unknown result must not trigger an automatic re-ask. Cross-vendor exactly-once must not
   be claimed.
8. An answer stores its body, the original question, the source product/connection, the time
   and any existing citations. The personalization rationale can be the assistant's judgment;
   every recommendation is not forced to carry a raw-data link, and an answer is not treated
   as a complete data export or a verified user memory.
9. In the MVP the user copies/pastes into Chat, Code or Work. The navigation SDK, deep links
   to answers, host history sync, cross-product delivery, shared answer retrieval and
   automatic long-term memory are explicitly deferred.

10. Ask shares Platform's public origin, HTTPS port and tunnel, mounted at `/apps/cats.ask/`;
    MCP is at `/apps/cats.ask/mcp`. The same entry point serves Platform, Cats Mobile and
    other Apps at once, routed by path and by each one's own authentication. Platform owns the
    entry configuration/lifecycle; disabling Ask revokes only Ask and does not interrupt
    Mobile or other Apps. The Ask tutorial shows the shared entry status and its own connector
    commands, does not collect an ngrok token, and does not require a separate domain, public
    port or backend installation. The frontend still fetches its own API directly; a shared
    URL path does not imply browser isolation, and the host must enforce the SPEC-122
    sandbox/grant.

## Consequences

- Ask can focus on verifying the first-party capabilities the user already has, keeping the
  UI separate from how each product is connected.
- The same App can onboard the three products one at a time, but each entry point has its own
  acceptance; the first success does not mean all three are done.
- Steps where the user signs in, starts or approves in the original product may remain; they
  must be presented and included in acceptance.
- Platform must add multi-component App execution and direct communication; the current
  renderer limits are not a product boundary. The user is not required to install a backend
  separately, start a terminal server or manage a second package.
- If a cloud assistant needs to call back to the local machine, it needs a restricted,
  reachable endpoint or relay. Deployment, authentication, versions and retention policy are
  fixed after the transport spike; this change opens no tunnel, reserves no port and deploys
  no service.
- Multi-level drill-down inside the App can be done with local UI state, with no prerequisite
  dependency on the navigation SDK.

## Alternatives considered

| Alternative | Assessment |
|---|---|
| Rebuild answers from raw data APIs / general search | Can serve other purposes, but cannot prove the original assistant's personalized understanding and authorized environment were used; not an acceptable substitute for this MVP. |
| Wrap every product in a synchronous provider completion | Cannot truthfully represent manual approval, deferred triggering and unknown completion state; use a background task plus immediate presentation instead. |
| Control the DOM of a signed-in page directly | Kept as a candidate if formal entry points are insufficient; identity persistence, page changes, reply completeness and recovery evidence must be recorded separately. |
| Desktop UI automation | The user does not want it as the first choice; only a fallback to evaluate explicitly later, not assumed selected. |
| Have the user move answers manually from the original assistant | Can serve as a comparison test; does not count as integration success where Cats delivers the question and retrieves the answer. |
| Build a cross-product knowledge base and automatic injection first | Beyond the user-specified copy/paste MVP; deferred. |

## References

- [SPEC-004](../specs/SPEC-004-personal-assistant-questions-mvp.md)
- [PLAN-005](../plans/PLAN-005-personal-assistant-questions-mvp.md)
- [Repository boundaries](../architecture.md)
- [Versioned App package foundation](001-own-official-utility-apps-and-coordinate-desktop-distribution.md)

*Created: 2026-09-29. Last updated: 2026-09-29.*
