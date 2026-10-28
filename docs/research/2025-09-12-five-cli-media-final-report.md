# Final Hands-on Report on Multimedia Capabilities of Five CLIs - 2025-09-12

Tester: sammykenny2
Test subject: Taipei cyberpunk night market, 1:1 low-resolution text-to-image -> 6-second 480p image-to-video
Prompt language: Traditional Chinese

---

## 1. Summary of Results

| CLI | Developer | Image generation (text-to-image) | Video generation | Quota / threshold | Tested file path |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Antigravity** | Google | **Yes**, `generate_image` -> **Imagen 3 hard-coded**, model ID cannot be changed | **No native**, requires own `GOOGLE_API_KEY` to use **Veo 2** / Veo 3, about $1.75-2.5 / 5 seconds | settings.json cannot change the model ID, needs an extra paid key | None, requires payment |
| **Grok Build** | xAI | **Yes**, `image_gen` -> **xAI Imagine**, supports 1:1, 16:9, 9:16, 3:2, 2:3 | **Yes (the only full pass)**, `image_to_video` 6s/10s 480p/720p image-to-video + `reference_to_video` 1-15s | **Must turn off /privacy (ZDR)**, otherwise errors with `Video generation tools are unavailable under zero data retention (ZDR)`. Or bring your own S3/GCS bucket | Image: `~/.grok/sessions/.../images/1.jpg`, video: generated successfully after turning off privacy (videos/ directory) |
| **Codex** | OpenAI | **Yes**, `image_gen__imagegen` -> **gpt-image-2** (officially documented), no ratio/resolution parameter, can only hint through the prompt | **No native**, no Sora tool | Uses Codex Pro regular quota; at test time 26% used, 74% left, credits 0 | `~/.codex/generated_images/01a091f5-1234-7122-8327-1f183874bed2/exec-861f1776-2c54-4fab-b45a-412fb93dbb8f.png` (1254x1254, 2.6M PNG) |
| **Claude Code** | Anthropic | **No**, the tool list has no image-generation tool, only screenshot upload / file sending. Can use Bash to call local ImageMagick/Pillow or external SD/Replicate | **No**, the closest is Chrome gif_creator recording browser actions into a GIF, not AI-generated | Needs own external model/API | None |
| **Muse** | Meta | **No** | **No** | Relies on plugins such as fb-knowledge.md | None |
| **Cursor** | Cursor | Not tested | Not tested | - | - |

---

## 2. Detailed Self-reports by Vendor

### 1. Grok Build (xAI Grok 4.6)
- Native tools: image_gen, image_edit, image_to_video, reference_to_video
- Image generation limit: only an aspect ratio can be chosen (auto, 1:1, 16:9, 9:16...); exact pixels such as 1024x1024 cannot be specified
- Video generation limit: image-to-video only, 6 or 10 seconds, 480p by default, 720p must be stated explicitly
- Failure case: with /privacy (ZDR) on, `image_to_video` fails with: `Video generation tools are unavailable under zero data retention (ZDR). To enable, either turn off /privacy mode to disable ZDR or supply a user-hosted storage bucket.`
- Success case: after turning off /privacy, the 6-second 480p image-to-video succeeded

### 2. Codex (OpenAI)
- Native tool: image_gen__imagegen (one of the 13 core tools)
- Model: officially documented as gpt-image-2; the tool returned no model identification
- Limits: cannot directly set ratio/resolution/quality; no lowest-cost setting
- Test: the Taipei cyberpunk night market image succeeded, 1254x1254 2.6M, path as above
- Video: no such native tool

### 3. Claude Code
- Search result: the whole tool list (150+ interfaces) contains no image or video generation tool
- Feasible alternatives: Bash running locally installed tools, an Artifact generating HTML/SVG, Chrome screenshots
- Test: cannot generate for free within the current quota, because there is no such native tool at all

### 4. Antigravity (Google)
- Developer: Google DeepMind experimental CLI, not directly related to Cursor
- Image generation: generate_image / generate_video are both hard-coded to Imagen 3
- Video: needs an extra GOOGLE_API_KEY to use Veo 2

### 5. Muse
- No native generate_image/video tool

### 6. Cursor
- Not tested this time, not included in the conclusion

---

## 3. Final Conclusion

> To run the full text-to-image -> image-to-video chain within the CLI quota without an external key, only Grok Build does it so far, at the cost of turning off ZDR.
> Codex only reaches the image, Antigravity's image is locked to Imagen 3 and video costs extra, and Meta and Claude Code only write code and do not touch generation.

The test prompt template (Traditional Chinese) was verified to work; see the conversation record for details.
