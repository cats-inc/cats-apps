# Research

No new external provider research was performed during repository initialization.
The initial decisions use local implementation inspection and the accepted user
direction from 2026-09-10.

Before implementing a provider-account quota collector, record current provider
evidence and fixtures in cats-runtime's research tree. Do not infer a live API
contract from this repository's planning examples.

Use dated research notes when future packaging or SDK choices depend on external
facts. Architectural decisions belong in ADRs, not in research notes.

The Ask baseline records product observations, official documentation and current
App constraints. Its follow-up records the standalone Bot probe, CLI enrollment
failure and revised complete-App ownership. Ask adapter evidence belongs with the
App; the initial experiment is documented in Runtime research, with executable
probe files still retained in the local worktree.

## Index

Research filenames follow `YYYY-MM-DD-topic.md`, matching the sibling Cats repos.

| Date | Topic | Scope |
|------|-------|-------|
| 2026-10-24 | [Final Kimi K3 probe: Cursor and Kilo](2026-10-24-kimi-k3-cursor-kilo-final-probe.md) | Cursor/Kimi generated one verified 1024-square JPEG but could not perceive the existing image despite a correct native payload; Kilo/Kimi understood it, without an exposed generator |
| 2026-10-24 | [Chinese-model cross-CLI re-probe](2026-10-24-chinese-model-cross-cli-reprobe.md) | Cursor/GLM generated one verified JPEG and uses an image-description bridge; Copilot/Kimi image input succeeds, Devin/DeepSeek input unavailable, Kilo/Seed baseline retained |
| 2026-10-24 | [Chinese-model CLI media probes](2026-10-24-chinese-model-cli-media-probe.md) | Four different labs through OpenCode Go, Kilo, ClinePass and Auggie; generation-tool inventories, existing-image understanding and model-specific input rejection |
| 2026-10-23 | [Three-provider real image probe](2026-10-23-three-provider-image-artifact-probe.md) | Spark, Flash and Sol each generated one verified image; actual PNG/JPEG dimensions, native receipt gaps, output paths and Muse artifact success followed by turn timeout |
| 2026-10-23; updated 2026-10-24 | [Studio CLI summary](2026-10-23-studio-cli-media-probe-summary.md) | Five-provider generation baseline plus four Chinese-model CLI routes: model pairs, evidence levels, controls, artifact collection and image-input gates |
| 2026-10-23 | [Eight-session CLI media inquiry](2026-10-23-eight-session-cli-media-probe.md) | Two selected models each for Muse, Antigravity, Claude and Codex through Desktop; tool/schema comparison, idle-refusal recovery and untested artifact boundaries |
| 2026-10-23 | [Grok 4.7 / Extra High Studio sample](2026-10-23-grok47-xhigh-studio-sample.md) | One separately authorized image, verified original JPEG, source sample replacement and Runtime profile selection; no publication or installed update |
| 2026-10-23 | [Grok 4.5 / Low comparison](2026-10-23-grok45-low-media-probe-comparison.md) | Separate Desktop inquiry with matched discovery prompt; capability, schema precision and source-coverage comparison against 4.7 / Extra High |
| 2026-10-23 | [Grok media inquiry through Desktop](2026-10-23-grok-media-capability-probe.md) | Grok 4.7 / Extra High capability inquiry, schema/documentation conflicts, historical artifact baseline and Studio expansion candidates; no new media generation |
| 2026-10-23 | [CLI media probe SOP](2026-10-23-cli-media-probe-playbook.md) | Repeatable case preparation, staged discovery/schema/output prompts, failure handling, comparison limits and artifact measurement cards |
| 2026-09-29 | [Personal assistant delegation baseline](2026-09-29-personal-assistant-delegation-baseline.md) | Historical baseline, Bot probe and CLI failure checkpoint, revised complete-App ownership |
| 2025-09-12 | [Five CLI media capability test report](2025-09-12-five-cli-media-final-report.md) | User-provided image/video test observations; original report date retained, source evidence and CLI versions not included |
