# Studio sample assets

| File | Origin | Notes |
| --- | --- | --- |
| `orange-cat.jpg` | Generated through Grok CLI in Cats Desktop on 2026-10-23, with agent model Grok 4.7 / Extra High (non-Fast) | 1024x1024 JPEG, 85,413 bytes, used only as the Studio preview placeholder. The media-model ID was not returned. Original bytes and embedded metadata are retained without re-encoding. Use of the image is subject to xAI's terms for generated output; it is not covered by the repository's MIT license as an original work. |

SHA-256: `6a4fe15907ac11becbc892029dd78cbf40c00590c82826ae638df5b93965867e`.
The same description as the earlier sample was used, with one `image_gen` call
and aspect ratio `1:1`; no retry or edit was requested. The earlier 2026-09-28
Fast/Low image is replaced in source. See the
[generation evidence](../../../docs/research/2026-10-23-grok47-xhigh-studio-sample.md).

Assets in this directory are inlined into the `.catsapp` archive by
`scripts/build-app.mjs`; this README is not packaged.
