# Personal Assistant Delegation Baseline

## Follow-up checkpoint (2026-09-29)

The sections below preserve the initial baseline. Subsequent work demonstrated
Grok Bot custom MCP registration, challenge response, and authenticated submission
of three X bookmark summaries; returned request/receipt IDs matched the local
probe. Bot initiation was manual, latest-save order was inferred from array order,
and video understanding was not tested. Local Cursor CLI OAuth and discovery of
41 X tools succeeded, but current-user/credit calls returned `client-not-enrolled`.
That route is not an accepted replacement for the Bot.

Evidence is summarized in the [Runtime research record](https://github.com/cats-inc/cats-runtime/blob/main/docs/research/2026-09-29-cats-ask-mcp-probe.md).
Executable probe files remain in the local `spike/ask-mcp-probe` worktree and are
not included in the documentation delivery. Private results and credentials
remain local and untracked. The temporary public endpoint was stopped.

The user clarified that one App must own multiple frontends/backends as one
install/update/manage unit, with normal App-owned API communication. Ask owns
its question service, data and MCP; Platform owns generic hosting and isolation.
The baseline's Runtime-owned Ask adapter/storage proposal is superseded by the
updated [ADR-003](../decisions/003-delegate-personal-questions-to-first-party-assistants.md)
and coordinated Platform ADR-125/SPEC-122/PLAN-115. Host component execution and
the installed Ask App remain unimplemented.

## Original baseline

Date: 2026-09-29. Scope: Ask planning, official documentation and local host inspection.
No authenticated Cats-to-assistant probe, connector installation or live user-data collection
was performed. Follow [ADR-003](../decisions/003-delegate-personal-questions-to-first-party-assistants.md),
[SPEC-004](../specs/SPEC-004-personal-assistant-questions-mvp.md) and
[PLAN-005](../plans/PLAN-005-personal-assistant-questions-mvp.md) for decisions and delivery.

## User observations

The user reports successful personal recommendations from Gemini Spark, including YouTube
recommendations based on interests. The user also reports identity-aware X history through
Grok Bot's X Connector, and explicitly reports that Grok web's connector does not provide
the same result. Meta targets include saved/self-authored/authorized posts and Reels summaries.
These observations establish the intended product value; they do not prove a Cats transport.
No private post bodies, account identifiers or credentials are recorded here.

## Official integration evidence

Sources below were opened on the date above. Availability and behavior still require the
actual user's account check. An official feature description is not an executed integration.

| Source | Observed statement | Remaining question for Ask |
|---|---|---|
| [Google custom apps](https://support.google.com/gemini/answer/17209137) | Custom MCP URLs can be connected; the page names Spark and chat. It lists personal-account, US, English, Activity and web/mobile conditions. It states that writes require manual confirmation and that shared data can include Personal Intelligence and Connected Apps. | Does this account have the entry, and can one Spark task query personal context and return it through the Cats connector? No unattended-write promise. |
| [Google Spark schedules](https://support.google.com/gemini/answer/17094710) | Time schedules and Gmail-filter events can trigger tasks. The documentation describes variable execution times. | Can a permitted trigger start the Cats task with the needed connector and data scope? Scheduling is not a public inbound task API. |
| [Grok Bot computer/apps](https://docs.x.ai/grok-bot/computer-and-apps) | Bot has a persistent cloud workspace/browser; connectors are installed as plugins and logins can persist. | Verify custom Cats connector installation in Bot, preserving the user's X Connector and Bot context. |
| [Grok Bot skills/routines](https://docs.x.ai/grok-bot/skills-routines-and-automations) | Skills describe work; routines can run on a schedule or supported event. | Verify a specific supported trigger and result return, including approval and pauses. |
| [Grok Bot teams](https://docs.x.ai/grok-bot/teams-and-enterprises) | Connector/MCP policies are described for teams, with some controls limited to Enterprise. | Team documentation does not prove that this user's individual Bot can install an arbitrary connector. grok.com behavior is not substituted. |
| [Meta Muse introduction](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/) | September 8 announcement describes a personal agent, dedicated VM and app/WhatsApp interaction. | Does the actual selected Meta product expose the needed private-content and delegation abilities? Muse and Meta AI evidence remain separate. |
| [Meta Connect announcements](https://about.fb.com/de/news/2026/09/meta-connect-2026/) | September 24 announcement includes an email address for Muse as another communication channel. | Account rollout, programmatic task delivery and answer retrieval have not been verified. This is not evidence of a generic Meta AI MCP/API endpoint. |

## Local implementation baseline

Read-only inspection of cats-platform main at `f9ec816b`:

- `packages/app-sdk/browser.d.ts` exposes SDK 1.3.0 identity, Usage, images and `openLobby`.
  There is no implemented Ask API or clipboard operation in that public browser contract.
- `src/app/renderer/AppRendererSurface.tsx` loads one `srcDoc` iframe with `allow-scripts`.
  Its policy denies direct network, child frames and workers; a subsequent document load
  revokes the bridge. In-document state/view changes can implement drill down.
- `src/shared/catsAppSdk.ts` contains broader design interfaces. Their presence does not
  establish executable storage, route-context, arbitrary action or cross-product APIs.
- Clipboard success in the opaque frame is untested; verify in the actual package/host.
  A narrow host write operation is an implementation candidate, not an existing capability.

This baseline informs App packaging/SDK dependencies. Future adapter traces and execution
contracts and generic workspace persistence belong in cats-runtime; App SDK, permissions,
read views and clipboard contracts belong in cats-platform. No filesystem links to another
machine's worktree are used as public API contracts.

## Feasibility status

| Product | User product behavior | Official integration clues | Cats delivery + return |
|---|---|---|---|
| Gemini Spark | User reports personal recommendations | Custom MCP and task triggers documented | Unverified |
| Grok Bot + X Connector | User reports identity-aware history; Grok web fails this goal | Bot connectors and routines documented | Unverified |
| Meta AI | Authorized content and Reels are the user's stated target | Related Meta/Muse announcements; exact transport unresolved | Unverified |

The proposed connector/task approach is an engineering hypothesis. It requires separate proof
of activation, retained personal capability and correlated answer return. Public-source API
results, fixture data or a manually pasted answer do not satisfy that full loop.

*Last updated: 2026-09-29.*
