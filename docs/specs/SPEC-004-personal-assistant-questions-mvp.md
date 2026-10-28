# SPEC-004: Personal Assistant Questions MVP

## Metadata

- Status: Shared-ingress candidate implemented; installed Windows Ask → ngrok → real Grok Bot read/submit/reopen passed (2026-10-25). Managed provider recovery, other operating systems, Mobile and other providers remain separate acceptance; no release selected.
- Owner: cats-apps for all Ask UI/services/data/MCP and package; cats-platform for component hosting/lifecycle and host capabilities; cats-runtime for optional shared execution capabilities.
- Working identity: **Ask**, `cats.ask`, source slug `ask`; initial unpublished development package 0.1.0. No release authorized.
- Decision: [ADR-003](../decisions/003-delegate-personal-questions-to-first-party-assistants.md).
- Plan: [PLAN-005](../plans/PLAN-005-personal-assistant-questions-mvp.md).
- Evidence: [2026-09-29 baseline](../research/2026-09-29-personal-assistant-delegation-baseline.md).

## Summary

Provide a Cats App that asks the Gemini Spark, Grok Bot and Meta AI the user already has,
obtains the answer that product can produce under the user's identity and authorized scope, and offers a copy button.
The user pastes the answer into Chat, Code, Work or elsewhere on their own.

## Confirmed user context

The following keeps the user's product requirements; the Grok Bot bookmark round trip already has probe evidence, and the other capabilities are verified separately:

- Gemini Spark can offer high-level suggestions such as interests, preferences and YouTube recommendations based on what it knows about the user.
  The Google Workspace raw-data APIs do not represent the same personalization capability.
- Meta's goals include saved posts, the user's own content, articles the user has permission to read, and Reels summaries.
- With the X Connector configured, Grok Bot can understand this user's posting history and handle related content.
  The user confirmed that the X connector in the Grok web version cannot achieve the same goal; the two must not be treated as equivalent entries.
  The user later clarified that they have not posted, so actual acceptance instead queries three saved bookmarks; it does not claim to have tested their own posting history.
- The core value includes the first-party AI's personalized understanding, the user-authorized content, and its ability to organize and judge it.
  Success with public post search or a plain model API is not enough to validate this MVP.

## Target products and content

| Product | Cats integration acceptance |
|---|---|
| Gemini Spark | Asked from Cats, it can still use the original product's personalization, and returns an answer that includes the reasons for its recommendations. |
| Grok Bot + X Connector | Query in the correct Bot/X authorization environment; posting history, private/saved content and video are each accepted according to the scope actually available. |
| Meta AI | Record the exact product entry and the available content scope; saved posts, own content, authorized articles and Reels are each observed individually. |

The Grok web version, the Grok Build CLI and a general model API are not equivalent substitutes for Grok Bot.
If Meta Muse becomes a candidate it needs independent entry evidence, and does not automatically inherit Meta AI's capabilities because of the shared brand.

## Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | A standalone App entry presenting assistant selection, question input, a Q&A list, detail, and a small copy button. The list and detail switch within the same loaded document. |
| FR-02 | Assistant options are identified by product and user connection, and present not configured/unverified, available, action needed, or unsupported; a general provider being available does not mean the personal assistant is available. |
| FR-03 | An execution is created only on explicit submit; delivery happens after the request identity is saved. Opening the App, switching pages, reopening, querying status and copying do not ask again automatically. |
| FR-04 | Support asynchronous status and re-reading. With no external confirmation, show waiting and do not presume it has started; requirements such as login and approval show the concrete next step. |
| FR-05 | Save the full answer text/Markdown, the original question, the product/connection, the time and any citations provided. Keep the recommendation rationale and uncertainty; the source field may be omitted. |
| FR-06 | Distinguish answered, partially answered, no content found and no permission. An assistant reply of "cannot access" can be recorded, but cannot count as passing acceptance of that private-content capability. |
| FR-07 | After the user presses copy, copy the body of the selected answer and the links in it; show copied only after success is confirmed, and on failure keep the text selectable and state clearly that it did not succeed. |
| FR-08 | After the App is left or closed, the background task does not depend on the renderer staying alive; reopening reads the saved status/answer. Whether replies can be recovered while the host is down is presented according to the transport evidence. |
| FR-09 | Each attempt fixes its target and question. Asking again creates an explicit new attempt; an identical resent reply is deduplicated and does not overwrite another question or another account's answer. |
| FR-10 | Platform performs App/owner hosting and host-capability authorization; the Ask backend performs connection/attempt/question permission and reply validation; Runtime authorizes only the Runtime capabilities actually used. Reply text is displayed only as data; scripts, commands or automatic publishing in it are not executed. |

## Minimal UX

1. The first usable entry is Ask Grok Bot, and the home page also lists existing questions.
2. Clicking drills down inside the App: at the top is a collapsible first-connection tutorial, below it the composer.
   The tutorial helps the user set up the Cats connector in the Bot; it does not require installing or managing an Ask backend separately.
3. Pressing "Create question" (建立提問) saves the request and shows "Copy Bot run instruction" (複製 Bot 執行指令). The user pastes it into the Bot to start it;
   the Bot picks up the specified question, uses the X Connector, and returns through the Ask MCP. Submit does not falsely claim to wake the Bot.
4. The detail shows the original question, status, full answer and limits, plus copy answer. Reopening reads the same record.
5. Querying again is explicitly submitted by the user. Gemini Spark and Meta are enabled once each is verified; there is no silent fallback.

Source links are at least kept as selectable, copyable text; an interface for opening external links is not a prerequisite for this round.
Video and Reels are accepted by the text summary the assistant returns; no video download or player is added.

## Proposed records and state semantics

The following is a conceptual contract; the Ask API/schema, the required host SDK capabilities, size and concurrency limits and the storage method are fixed in PLAN-005 A2.

| Record | Required meaning |
|---|---|
| Connection | The owner, the specific product, a non-sensitive identifier of the assistant/account environment, availability status, verified capabilities and observation time; creating a connection does not mean all data permissions are verified. |
| Question / attempt | A stable request ID, question text, the fixed connection, status, time, the external receipt when available, and the reason user action is needed; only an explicit re-ask produces a new attempt. |
| Answer | The attempt it belongs to, answer text, answer/receipt time, source product/connection, optional citations, and a result such as complete/partial/no permission/no content. |

| State | Required observation |
|---|---|
| queued | The question is saved locally; delivery is not yet confirmed. |
| awaiting_assistant | The question can be obtained by the external assistant or has been delivered; the start of execution has not been observed. |
| running | The chosen transport confirms the attempt is executing; an adapter without this evidence may skip this state. |
| needs_user | Explicitly needs login, launch, approval or other manual work; keep the earlier stage so it can resume after completion. |
| succeeded | The reply was checked against the attempt/connection and durably saved; separately record whether the result really contains the required content. |
| failed | There is explicit evidence of terminal failure, and the question and an understandable reason are kept. |
| unconfirmed | After a timeout, disconnection or restart it cannot be confirmed whether the external side finished; the same execution can be queried or recovered, and silent resending is forbidden. |

queued → awaiting_assistant → succeeded is allowed, with no need to invent running.
After needs_user is completed, resume according to the receipt; unconfirmed can become succeeded on receiving a valid late reply.
An identical repeated reply keeps the original result; a conflicting reply keeps the original result and is reported, and the last write does not arbitrarily overwrite.
A late reply can only complete its original attempt, and cannot fill a new attempt the user asked later.

## Host and Runtime integration requirements

- Ask is a single install and update unit and may contain multiple frontends/services/workers. All components are declared and delivered
  by the App package, and Desktop enables, disables, repairs and removes them together; the backend is not a second install item.
- The Ask frontend directly uses ordinary HTTP/streaming to operate its own connection, question, list and answer APIs.
  Platform provides sandbox isolation, shared-entry routing, identity/permissions and startup information, and does not add an SDK method for each Ask
  operation. The platform can route transparently, but does not own Ask API's domain schema.
  The SDK is reserved for the clipboard, host navigation and other Cats capabilities; their methods and authorization are fixed by Platform.
- Copy must be verified in a real sandboxed App. If needed, provide a host clipboard bridge that is triggered by a user click and only writes text;
  it does not need to read the clipboard or loosen general network/same-origin permissions.
- Q&A data is held by the Ask backend, in the App data directory outside the package bytes. Ask is responsible for
  schema/migration, and Platform coordinates the update, backup and enablement of the whole App. The common Runtime
  storage may be used if actually needed, but the Ask domain must not be moved into Runtime just because persistence is needed.
  Private answers are not written into Cats product knowledge documents.
- External login and data connectors stay in the other product. The Ask frontend can access its own declared API without obtaining
  an external provider token or host permission; the outbound reply channel is limited to the specified owner/connection/attempt.
- The Ask adapter is responsible for the product entry and execution receipt. Official API, MCP pickup/return, events or schedules are only
  candidates. For the three products, fix separately the capability matrix of launch, readable data, recovery and manual approval.
- Platform, Cats Mobile and all Apps share one public origin / HTTPS port / tunnel.
  Platform owns the entry settings, routing and tunnel lifecycle; Ask mounts `/apps/cats.ask/`,
  the private API is `/apps/cats.ask/api/...`, and the MCP is `/apps/cats.ask/mcp`. Internal services may
  use a dynamic loopback port / IPC, and a localhost URL must not be given to a remote browser or Mobile.
  Disabling, updating or removing Ask revokes only its own routes and grants, and does not stop the shared tunnel or other Apps.
  Runtime's existing MCP is not Ask's public entry; there is no flow for installing a backend or tunnel App separately.
- The shared entry's private API still needs an owner/App/generation grant, using ordinary fetch with
  `credentials: omit`; MCP uses Ask connection/attempt authentication, and the two cannot be exchanged.
  The host shell verifies the viewer, and the App document uses an opaque sandbox; a path prefix does not constitute isolation.
  Platform is responsible for the CORS / CSRF / frame bridge / URL boundary, accepted per Platform SPEC-122.
  Opening the App remotely does not grant the right to install or manage native components; the Desktop management boundary stays independent.
- The tutorial only shows the shared-entry status provided by the host and the Ask endpoint, opening the Platform
  remote-access settings when necessary. The App does not collect, store or manage ngrok/Tailscale account credentials.
  When the public URL changes, show the steps for reconfiguring the Bot connector; keep questions, answers and receipts,
  and do not re-ask automatically. Platform is responsible for validation, backup, atomic migration and failure recovery of the prototype ingress settings.
- The system must distinguish local request deduplication from external execution deduplication. When the external receipt cannot be confirmed, keep unconfirmed;
  only an explicit re-ask by the user creates an attempt that may incur new usage.
- Private answers do not enter tracked test fixtures, research attachments or logs; the acceptance report keeps de-identified conclusions.

## Deferred scope

- Cats deep links to answers, and syncing the App's internal pages with the host back/forward.
  Cats-platform will evaluate a navigation SDK later; the user explicitly asked that this MVP not do it.
- "Use in Chat/Code/Work", automatic cross-product carry-over, a shared answer search tool, automatic continuation after notification,
  and automatically adding answers to long-term memory. The MVP has the user copy and paste on their own.
- Full offline queuing/sync, a commitment to continuously running cloud hosting, advanced classification, answer comparison and user-managed periodic schedules.
  If the transport needs the other side to pick up questions on a schedule, that can be an integration setting, without expanding into a scheduling product feature of the App.
- Publishing to the source social platform, liking, modifying bookmarks or deleting content; this MVP only queries and returns answers.
- A new video player/downloader, Market or Desktop publication. Platform's general App multi-component execution
  is a required prerequisite for this App, delivered per Platform SPEC-122; deferring the server/worker is no longer a reason
  to require the user to start a backend separately.

## Acceptance

| ID | Acceptance evidence |
|---|---|
| AC-01 | An actual Cats request → Gemini Spark → Cats reply that includes personalized recommendations the user recognizes, with reasons; record the manual steps; it need not match past recommendations verbatim. |
| AC-02 | An actual Grok Bot + X Connector query and recovery, where the user can check their own content/history; record the kind of content tested, with no substitution by the Grok web or a model API. |
| AC-03 | An actual round trip through the specified Meta AI entry, checking the authorized content / Reels summary tested; list the verified and the unobtained scope. |
| AC-04 | Entries that have not passed a round trip are still marked unverified or unavailable; success on any one product does not mark all three complete. |
| AC-05 | With the real built package and an isolated host, test list → detail → back, completion after leaving the page, and reopen reading. |
| AC-06 | In Desktop, after pressing copy and pasting into a test text area, Chinese text, line breaks, links and long answers stay identical; when the clipboard refuses, success is not shown. |
| AC-07 | Request resend, duplicate/late/conflicting replies, disconnection and restart do not mix answers or silently re-ask; with no receipt it stays unconfirmed. |
| AC-08 | Calls with the wrong owner/connection/attempt and with revoked permission are rejected; a malicious answer is displayed only as data. |
| AC-09 | Confirm the actual minimum host/SDK/Runtime compatibility contract, install does not call a provider; tests use only an isolated registry/state. |
| AC-10 | One public origin / port / tunnel serves Platform, remote Mobile, Ask and another App/MCP at the same time. The Ask URL contains no server localhost; disabling Ask does not affect other services; cross-App tokens and unauthorized private APIs are rejected, and Copy is re-verified in the new sandbox. |

AC-01–03 each need minimal round-trip evidence from a real account; a fixture success only proves the program handling and cannot substitute.
Login, product-side approval or manual launch may be marked assisted; a human carrying the answer back cannot count as the recovery channel succeeding.
While any entry has still not passed, report its status and next experiment; partial completion must not be described as full support for all three.

## Shared-ingress candidate checkpoint (2026-09-29)

Ask uses the Platform's `/apps/cats.ask/` mount. Its relative bootstrap base URL
and view bearer authorize direct HTTP with credentials omitted; MCP uses its
separate connection/attempt credentials. The tutorial shows shared readiness and
the complete `/apps/cats.ask/mcp` URL, and opens host setup through
`catsApp.openRemoteAccess()`. It never collects a tunnel authtoken.

Copy uses the permission-checked `catsApp.clipboard.writeText` bridge.
Connection-state refresh preserves composer text/focus, and initialization retry
does not reload a consumed launch ticket. Actual installed Windows Electron
acceptance includes opaque-frame isolation, close/MCP reply/reopen, real
clipboard paste, denial feedback and host setup navigation. See PLAN-005 for
archive identity and remaining live external acceptance.

## Historical local Grok prototype (before shared ingress)

The implementation branch introduces the initial private Ask package identity
`0.1.0`; this is not a release or a bump of an existing App. Its archive requires
the unpublished Platform component contract (envelope 2), in addition to the
manifest version ranges. Current published renderer-only hosts cannot install it.
Development acceptance consumes a built/versioned Platform candidate package,
never imports sibling source. The final released host minimum remains a release gate.

Ask owns one HTML frontend and one bundled service containing private `/api` and
external `/mcp`. Its state is `ask.json` schema 1 in the host-provided generation
directory. Writes are serialized and atomically replace the file after retaining
a validated previous-state backup; malformed data is not reset. The App migration
validates recognized schema 1; later schema changes must add an explicit migration.

One local connection has a random bearer credential. Each question has a distinct
request ID, attempt ID and secret; MCP never lists questions. Connection rotation
revokes old attempts. Fetch and submit require all identities to match. Equal
answer retries return the original receipt; conflicting answers preserve it.
Reopening changes unresolved `awaiting_assistant` to `unconfirmed` and never sends
anything. Preparing the same question returns the same attempt; explicit re-asking
creates a separate record.

Numeric bounds: 8,000 question characters; 64,000 answer characters; 20 HTTPS
sources with 2,000-character URLs; 4,000 characters each for evidence/limitations;
500 questions; 32 MiB state; 512 KiB request body; 8 simultaneous MCP requests;
120 MCP requests/minute/connection; unanswered attempts expire after 7 days.
Completed identical receipts remain retrievable after expiry. No source content,
question text, connection secret or answer is written to product logs.

The UI offers Ask Grok Bot, a collapsible first-connection tutorial, composer,
question detail and recent questions. Creating a question saves it first.
Preparing and copying its instruction are explicit actions; the user pastes into
Bot to initiate. The prototype tutorial configures per-App ngrok ingress; this
must be replaced by shared Platform ingress status/setup and an `AddMcpServer`
instruction using `/apps/cats.ask/mcp`. That UI correction is not implemented.
Bot's X Connector remains untouched.
Answers, sources, evidence and limitations render as text and can be copied.
Gemini Spark and Meta AI remain unavailable pending their separate real proofs.

## Compatibility and open decisions

New SDK capabilities are preferably added compatibly, preserving existing App contracts. If an existing public or persisted-data contract must be broken,
record the needed version boundary in the owning repo; a data upgrade needs validation, backup, atomic replacement and failure recovery.
See the section above for the initial implementation version; this shared-entry document revision neither sets nor changes a package version, and nothing is published.
The host's minimum release version is fixed only after implementation and install evidence appear.

Remaining: Platform's shared entry / sandbox and the exact bootstrap contract, a real Bot round trip for the candidate package,
transport / account / approval verification for Spark and Meta, and the actual release compatibility floor. Ask's initial data
schema, numeric limits and unconfirmed policy are fixed in the section above; later work is accepted per PLAN-005.

## References

- [App/package ownership](../architecture.md)
- [Official App package requirements](SPEC-001-official-utility-app-packages.md)
- [Existing Studio App slice](SPEC-003-media-studio-vertical-slice.md)

*Created: 2026-09-29. Last updated: 2026-09-29.*
