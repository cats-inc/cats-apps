# Studio sample replacement with Grok 4.7 / Extra High

Last updated: 2026-10-23 (UTC+8). The owner selected Grok 4.7 / Extra High (non-Fast)
for Studio and authorized one image through the existing Desktop Chat conversation.
The room-generated working directory was confirmed before dispatch.

One image_gen used the same prompt as SAMPLE_PROMPT and aspect_ratio 1:1. The
actual JPEG decoded to 1024 x 1024, 85,413 bytes, and visual inspection confirmed
the orange cat on a blue background without text. Its SHA-256 is
`6a4fe15907ac11becbc892029dd78cbf40c00590c82826ae638df5b93965867e`.
The exact session's media event log independently showed one matching image_gen
and its completed ImageGen result. No retry/edit/video was performed.

The original file replaces apps/studio/assets/orange-cat.jpg without re-encoding.
SAMPLE_PROMPT, image dimensions, alt text and sample title remain accurate, so
the renderer needs no structural change. The
[asset README](../../apps/studio/assets/README.md) records the new origin.
The previous sample digest was
`26825f36213f687376e483453dd5b077d4ccce5e5cfdb1ed4fde6da37718b087`.

Runtime separately changes its catalog-owned execution profile from
grok-4.7-build-fast / low to grok-4.7 / xhigh. The underlying media-model ID is
still unknown; these labels identify the tool-planning agent. See the
[Runtime evidence](../../../cats-runtime/docs/research/2026-10-23-grok47-xhigh-studio-sample.md)
for invocation provenance and the boundary between Chat generation and Studio's
bounded HTTP/SDK execution.

The two earlier inquiry turns remain text-only research. This separately
authorized generation supersedes their no-generation instruction for one image
only, without authorizing further generation, privacy changes or publication.
The source replacement and isolated candidate package do not overwrite any
published .catsapp bytes or install changes in the user's Desktop profile.

## Local validation

- Existing Studio package test passed, including repeatable encoding and bounded
  permissions. A separate temporary 0.2.1 candidate archive has SHA-256
  `88162ed1958a8d48c1629335c239a0f50adea2e310e4d4b4984ace76fb3eb950`.
- Extracting the archive confirmed the embedded sample is byte-identical to the
  new original JPEG. The asset is defined once and reused by the renderer.
- Platform's existing isolated host/SDK browser fixture passed: preview,
  enlargement, byte-identical download, reload, offline works, cancellation,
  narrow viewport, iframe isolation and Home navigation. Both fixture submissions
  used the supplied image; CLI calls were zero. Desktop/narrow screenshots were
  retained privately and the desktop image was visually inspected.
- Documentation and whitespace checks passed; unavailable sibling links in the
  nested worktree were checked separately against the two actual worktrees.

The browser fixture initially hit the Windows sandbox's parent-directory read
restriction in esbuild. The same isolated fixture passed through the approved
executor outside that sandbox, with a fresh temporary browser/profile/registry;
its browser and listener closed afterward. The real Desktop profile was not used
for these synthetic jobs. The pre-existing Desktop CDP endpoint remains open.
