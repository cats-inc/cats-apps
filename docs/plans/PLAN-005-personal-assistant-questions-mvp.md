# PLAN-005: Personal Assistant Questions MVP

## Metadata

- Status: Shared-ingress candidate implemented and independently reviewed. Installed Windows Ask/ngrok/real Grok Bot round trip passed (2026-10-25); managed-provider recovery, Mobile and other-OS acceptance remain separate.
- Working identity: Ask / `cats.ask`; initial unpublished development package 0.1.0; no release selected.
- Delivery: commit, push and auto-merge PR authorized on 2026-09-29; no package publication or version bump.
- Owner: cats-apps; Platform and Runtime own their corresponding integration work.
- Decision: [ADR-003](../decisions/003-delegate-personal-questions-to-first-party-assistants.md).
- Requirements: [SPEC-004](../specs/SPEC-004-personal-assistant-questions-mvp.md).
- Baseline: [2026-09-29 research](../research/2026-09-29-personal-assistant-delegation-baseline.md).

## Delivery order

Grok Bot + X Connector, with manual launch and an MCP return, has passed an independent probe, so this entry is delivered first.
The first full package, the component host, and the shared entry for Platform, Mobile and all Apps have been implemented and passed local
fixtures; a real Grok Bot round trip from Windows Ask has also passed. The full AC-10 external
multi-mount acceptance is still to be run. Ask directly owns its own API, storage and MCP; the SDK is used only for host capabilities.
Gemini Spark and Meta AI keep their own verification, and are not enabled just because they share a brand or a general API succeeded.

The user had earlier authorized opening a worktree for implementation; after the shared-entry documents went first, the Code Canvas MCP
proposal was checked and the local candidate implementation was completed. Code's internal MCP does not go through the public entry; App MCP is forwarded by the shared router.
Later execution proceeds according to the user's authorization at the time and account availability; this plan does not by itself start long-running schedules or deploy a relay.

## A0 — Scope and baseline

- [x] Fix the MVP as asking, asynchronous replies and copy/paste, and record that the navigation SDK and cross-product integration are deferred.
- [x] Separate the user's own testing in the original products, the official documentation, and the round trips on the Cats side that are not yet verified.
- [x] Check the existing renderer and SDK: same-document drill down is confirmed available, and the Ask and clipboard bridge remain to be added.
- [x] Create the ADR/Spec/Plan and indexes, keeping sources and next steps.

Done when: the documents link to each other and their statuses agree; unfinished spikes and product acceptance are not marked complete.

## A1 — Three product feasibility probes

Each product first completes one minimal query round trip, then tests the necessary failure and approval scenarios; polishing the full App is not a prerequisite.

| Order | Probe | Required observations |
|---|---|---|
| 1 | Grok Bot: the user's own three saved bookmarks, plus a separate video summary test | The MCP round-trip receipts were checked; the latest saved order is only inferred, and video understanding, automatic triggering and product recovery are unverified. |
| 2 | Spark: the interest and YouTube personalized recommendations the user has already asked successfully | The exact account and product mode, question delivery, whether Personal Intelligence and the connector work in the same task, the return, and the approval steps. |
| 3 | Meta AI: saved, own or authorized articles, plus a separate Reels summary test | The exact Meta entry, content scope and return method; Muse candidates are recorded separately and do not inherit evidence from other entries. |

- [ ] For each product, build a matrix of product and account conditions, trigger, personal-data capability, result return, manual steps and recovery.
- [ ] Check the official delegation entry first; if MCP is used, verify that a custom connector can actually be installed and called.
      The MCP documentation on grok.com is not substitute evidence for Grok Bot capabilities.
- [ ] Verify that the external AI picks up an explicit Cats question, uses its existing personal context, and returns through a machine channel.
      If manual login, launch or approval is unavoidable, record it as assisted; a human carrying the answer back does not count as an integration pass.
- [ ] Confirm the message source and request correlation, reply completeness, available receipts, latency and product usage information (record unknown as unknown).
- [ ] If a cloud endpoint is needed, first fix the owner of the temporary service, its restricted capabilities, authentication and teardown; do not expose the whole Runtime.
- [ ] When the official entry is insufficient, record the specific gap and then evaluate a browser DOM bridge; the Desktop UI is not the default approach.
- [ ] Real private content stays in a data location the user has authorized; tracked documents record only de-identified results, dates, versions and limits.

Condition to enter A2: at least one product has a fully implementable round trip, and the others keep their status and next experiment.
A1 is complete when: all three products have a traceable feasible or blocked conclusion; only passing SPEC AC-01–03 allows claiming all three are done.
If none can complete a round trip, save the specific limits and report them; do not pass off public search, manual carrying or a general model API as success.

## A2 — Owning-repository contracts

Following the A1 evidence, create a worktree in each owning repo, read its guidance, and add the corresponding ADR/Spec/Plan.
Platform ADR-125 / SPEC-122 / PLAN-115 already record the coordination contract; the coordination worktree has implemented the execution capability.

- [x] Platform: fix the multi-frontend, multi-service and worker manifest, direct HTTP/streaming within the same App,
      prototype origin and authorization, whole-App install, update, enable/disable and removal, and the clipboard capability;
      A4a has added local acceptance for the shared entry and the new sandbox, and the real external network is verified separately.
- [x] Apps: fix Ask's own API and data schema, adapter delivery, MCP pickup and return,
      status observation, receipts, deduplication and handling of unknown completion. Runtime participates only when a common execution capability is needed.
- [x] Fix the mapping of Ask request → external question → answer and the reply authentication;
      resending an identical reply is not saved twice, and replies that conflict, are expired, or cross connection or attempt have explicit rules.
      This does not prove that an X or other provider account is verifiably bound to a Cats connection.
- [ ] Separately verify the mapping to the actual assistant or provider account and account switching; a successful check of the connection/attempt token
      cannot substitute for evidence of the external account identity.
- [x] Fix the retention, resend and polling responsibilities when the host is down. With no persistent receiver, the UX does not promise instant receipt after a shutdown.
- [x] Fix the numeric limits: question and answer size, wait deadline, concurrency and queue, retention, and bounded logging.
      These must have values before the executable schema and storage are implemented, and are not left as unbounded defaults.
- [ ] Define the rules for the user deleting or retaining answers; count and timeout limits are not a data-deletion policy.
- [ ] Judge compatibility and data upgrade. If existing data is affected, first define validation, backup, atomic replacement and failure-recovery tests;
      do not substitute resetting data or only bumping the version. Record the version requirement first; publishing follows authorization separately.

Done when: concrete contracts, owners, limits and a fixture strategy are available for implementation; at least one A1 entry has passed.

## A3 — Complete App hosting and Ask services

- [x] Platform first passes a single-App fixture with two frontends, two services and a worker; whole-App install and
      update, disable and removal, with the frontend calling the App API directly and no Ask domain SDK methods added.
- [x] First implement request persistence, execution delivery, status/read and full-answer storage, so processing continues after leaving the renderer.
- [ ] Test success, partial, no permission, no content, needs_user and unconfirmed with isolated fixtures.
- [ ] Verify duplicate submission, reply resend, conflicting and late replies, recovery after shutdown, and that re-asking creates a new attempt.
- [ ] Verify the read and reply-receipt policy after a change in disabled state, version, account or connection, without leaking another account's results.
- [x] Windows Electron clipboard passes for both the prototype and the A4a opaque sandbox.
- [ ] Connect the other entries that pass A1 under the same Q&A contract, each keeping its own capability differences and acceptance status.

Done when: the App components and the direct communication contract pass focused checks, with both fixture and real transport evidence.
After installation the user does not need to open a terminal server or install a backend separately.

## A4 — Ask App and package

- [x] Add a standalone `apps/ask`, with one package containing all Ask frontend, backend and MCP; it consumes the versioned host contract.
      Its own API uses ordinary HTTP/streaming, and host capabilities use the SDK; it does not import sibling private source.
- [x] Implement assistant selection, question input, list and detail, status, and a small copy button; the UI switches within the same document.
- [x] Keep the question, full answer, rationale and optional citations; text is rendered safely, and no action is executed automatically from an answer.
- [x] Opening, reopening and refreshing only read existing records; a question is asked only when submit is pressed explicitly.
- [x] Entries that are unverified or have lost authorization show an understandable status; another product is not silently chosen.
- [ ] Once the minimum host/SDK contract needed is determined, set the new package version and compatibility range per the release authorization.
      Development fixtures and prototypes first use isolated output and do not change the version of any existing App or Desktop.
- [x] Produce a candidate with the existing builder and verify the actual archive; a source page does not replace package acceptance.

## A4a — Shared Platform ingress correction (implemented; external AC-10 open)

- [x] Update the ADR/SPEC/PLAN: the whole of Platform, Mobile and all Apps share one entry,
      the `/apps/<appId>/` route is owned by the host; each App is still a single package and lifecycle.
- [x] Together with Platform PLAN-115 P4, fix the exact bootstrap contract for the reachable base URL, view grant and shared
      ingress status/setup; the App's own API remains ordinary fetch.
- [x] The tutorial removes Ask-specific ngrok token/setup; it shows the Platform shared-entry status,
      leads to the host settings when it is not configured, and once done generates the `/apps/cats.ask/mcp` connector command.
- [x] In the opaque sandbox, verify fetch, Copy, drill down and reopening, and handle grant revocation,
      without relying on the server localhost or a Platform cookie. The navigation SDK and answer deep links remain deferred.
- [x] Along with the host settings migration and URL change, keep existing Ask data and receipts; when the user must update
      the Bot connector it is shown clearly, with no automatic re-asking or data reset.
- [ ] Pass AC-10: Platform/Mobile + Ask + a second App/MCP on a single external entry,
      with cross-App and auth rejection, and other services uninterrupted when Ask is disabled. The single-Ask real Grok Bot round trip has passed.

## A5 — Acceptance and handoff

- [ ] Against SPEC AC-01–10, record separately the actual round trips of the three products, assist steps, content types and unverified limits.
- [ ] With an isolated registry and state, run list and detail, reopen, failure recovery and clipboard tests on the built package.
- [ ] Verify Chinese text, line breaks, links and long-answer pasted content on the actual Desktop host; other OSes are listed separately as unverified.
- [ ] Record separately the different kinds of evidence: code focused checks, fixtures, real product round trips and installed acceptance.
- [ ] Update the status of each repo and complete the independent review; do not describe working-branch documents or local artifacts as a published feature.

This plan does not require Market, the navigation SDK, cross-product injection or full offline sync to be done before this MVP is acceptable.

## Risks and planned responses

| Risk | Response |
|---|---|
| Can ask but cannot read private data or return within the same task | A1 verifies the three links separately; keep the testing in the original product and do not swap the data target. |
| MCP return needs approval every time | Accept an observable needs_user and record the manual frequency; do not disguise an outbound reply as a read-only tool. |
| One product is blocked by latency or account limits | Continue with other entries, but keep the overall three-product acceptance unfinished. |
| Local shutdown misses a reply | A2 fixes the storage and resend responsibility; what cannot be recovered stays unconfirmed, with no automatic re-asking. |
| Copy fails in the iframe | Verify the actual package, add a host clipboard if needed; on an explicit denial keep the text selectable. |

## Resume checkpoint

2026-10-25: on an existing Windows Desktop 0.9.7 install, the development build of Ask 0.1.0, the user set up
ngrok and the Grok Bot connector themselves, created a real question from Ask, and pasted that run's instructions.
Grok Bot returned through `cats_get_question` / `cats_submit_answer`, Desktop showed that the answer was received,
and it could still be read after leaving the list and reopening. This is a single real round trip started manually; it does not mean a question can be created by asking the Bot directly,
and it is not acceptance of the new managed ngrok recovery. Private questions and answers, connection credentials and one-time
attempt values are not written to documents. The temporary helper was stopped, the shared entry was restored to its previous disabled setting, and Ask and its answers were kept.

That installed/live archive used the locally packed Platform 0.9.7 / SDK 1.9.0:
`3ad82d21b23e3261b84b7d91bdc893a5213645b4702beeae4be39bc87a9b82b9`.
This round fixes CI: the builder is pinned to the published Platform `0.9.3` / SDK `1.8.0`,
and per Platform ADR-128 `catsPlatform` is treated as the minimum host version; `appSdk` still uses a bounded range.
Ask adds the same actual-build/host-validation regression as Usage and Studio.
The hash of this reproducible candidate is
`0f3853ca845b5435faf2f091b79049d5f960c4f3921565501d06eb1bed91e217`,
and must be recorded separately from the live bytes above; the App source, version, manifest and renderer are unchanged.
The reproducible candidate then passed, in an isolated Windows Electron, MCP get/submit, reopen, the actual clipboard,
clipboard denial, the opaque frame and host Settings navigation. The independent review had no remaining findings,
and 44 Apps tests passed. No version bump, publication or change to the Desktop App pins.

Historical checkpoint — 2026-09-29 shared-ingress candidate: Apps 16 tests, Ask archive build and doc checks passed.
Platform's real router fixture passed Mobile auth + two Apps/MCP, with
cross-permission rejection on the same entry, single-App disable and owner session revocation. This is a local forwarding-side test and does not claim
that the external-network tunnel or a real Bot has passed with this version. Platform also tested settings backup, atomic-write failure and restart recovery.

Windows Electron used the actual archive to verify create, close, MCP get/submit, reopen,
Copy and paste, the Copy-denied prompt, and opening host settings; the opaque frame cannot read the host DOM, cookie or storage.
New archive SHA-256:
`0f3853ca845b5435faf2f091b79049d5f960c4f3921565501d06eb1bed91e217`.
The build/pack consumed the candidate SDK tarball, did not import sibling source, and the release pin is unchanged.
The independent review fixed the settings navigation permission, stale connection status, one-time ticket retry and host-close race;
the re-review had no remaining blocker. Nothing was committed or published, no real profile was changed, and private X content was not queried again.
The next step is the real external-network / Bot acceptance for the last item of A4a, then handle the host/SDK compatibility boundary per the publication authorization.
Doc checks: 43 Markdown / 161 local targets; the 9 documents modified this round across the two repos were also checked against
59 mapped targets, all present; whitespace checks passed on both sides.

Historical checkpoint — 2026-09-29 shared-ingress correction: at that time the ADR/SPEC/PLAN went first, and A4a / Platform P4 were not yet implemented.
What follows is the historical fixture of the earlier standalone App origin / ingress, which cannot serve as AC-10 or new-sandbox
acceptance; the code remains in the original worktrees, unpublished. This round did only the document diff/link and independent review.

This round's doc checks: `check:docs` passed (43 Markdown, 161 local targets, 39 sibling
links skipped by the standard check); a mapping check of the 36 modified documents across the two repos found all 1,244 local and
sibling targets present; whitespace checks passed on both sides. The independent review fixed the ingress
ownership conflict, overstated completion wording on external account verification and the deletion policy, the credential distinction, and leftover edit text;
the re-review had no remaining blocker. These checks do not constitute implementation acceptance of the shared entry or the new sandbox.

2026-09-29 implementation: `feat/ask-mvp` / Platform `feat/app-components`.
Apps 16 tests, the Usage build, the Ask archive build and doc checks passed. The coordination SDK was built by Platform
and packed into a tarball, then installed with no-save; the existing release pins are unchanged.
The actual package on Windows Electron passed create → close → MCP get/submit → reopen → Copy →
paste (Chinese, line breaks, links and literal script text); replies used an isolated fixture,
with no real X content. Archive SHA-256:
`9e362b428837928457bbb6b3d0aa85e645fa344625d16d7cfe61c53c4933b6f6`.
Store/transport coverage included duplicate and conflicting, expired and late replies, unconfirmed after restart, connection rotation
and cross-attempt rejection. The independent reviews on both sides had no blocker after fixes. Not done: commit, publication, installing into a real
profile, or testing the live Bot with this version; real ngrok account connection, macOS/Linux and other assistants remain to be verified.
Final doc checks passed: 42 Markdown, 159 local targets; the modified documents in the two worktrees were also checked for
cross-repo mapped links, all 441 targets present; `git diff --check` passed on both sides.

2026-09-29 follow-up: the Grok Bot synthetic and authenticated bookmarks probes returned and the receipts were checked;
save order is only inferred from the array, video understanding is unverified, and the Bot is still launched by the user. Cursor CLI OAuth and
41-tool discovery passed, but the data calls returned `client-not-enrolled`, so it is not a usable fallback.
See the [Runtime research record](https://github.com/cats-inc/cats-runtime/blob/main/docs/research/2026-09-29-cats-ask-mcp-probe.md) for detailed evidence.
The experimental code is still kept in the local spike worktree and was not committed with the documents.
This round corrects App ownership: one package may contain multiple frontends and backends, managed together; the next step is A2/A3.
Doc checks: `npm run check:docs` passed (42 Markdown files, 159 local targets);
a cross-worktree mapping check also covered 1,338 targets across the 36 modified documents, all present. The independent review pointed out
the old authorization and migration-ownership clauses; the re-review after the fix had no blocker. No App build/test was run,
no real registry was rewritten, and no product was published; the user later authorized committing and pushing the documents directly to main.
These checks are not multi-component execution acceptance.
The historical checkpoint of the first round of documents is kept below and must not be read as the current state of no probes having been done.

2026-09-29: the first round of document drafts was completed in `.claude/worktrees/ask-mvp-scope`, branch `docs/ask-mvp-scope`.
The next step is the Spark personalized-query round trip verification in A1; Grok Bot and Meta AI keep the same MVP target.
No App was created, no relay deployed, no third-party connector configured, no personal assistant called, and no user data rewritten.

Document validation:

- `npm run check:docs` passed: 42 Markdown files, 158 local targets; 37 sibling links outside the worktree were skipped by the standard check.
- A link mapping check on the 13 new or modified documents this round: 112 local and 7 sibling targets all present; no trailing whitespace or missing final newline.
- `git diff --check` passed. The main checkout stayed on a clean `main`.
- This round was documentation work; no App builds/tests, real product round trips or independent review were run.
- The user later authorized the commit and PR, with auto-merge after the repository checks pass; product implementation has not started.

*Created: 2026-09-29. Last updated: 2026-09-29.*
