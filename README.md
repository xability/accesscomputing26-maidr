# AccessComputing Partner Meeting: MAIDR

**Data (In)sight for All: Multimodal Chart Exploration with MAIDR**

JooYoung Seo | AccessComputing Partner Meeting | October 23, 2026
11:00 a.m. Pacific / 1:00 p.m. Central

This is a separate copy of the October 14 IS 529 ProSem deck. The original [ProSem repository](https://github.com/xability/prosem26-maidr) is unchanged. Core slides, visual styling, Python/R examples, audio and images are reused. The cover and speaker notes are adapted for AccessComputing; the AI example uses Claude.ai and AccessComputing partner categories instead of iSchool enrollment.

## Published presentation

- Short link: https://tinyurl.com/accesscom-maidr
- GitHub Pages: https://xabilitylab.ischool.illinois.edu/accesscomputing26-maidr/
- Repository: https://github.com/xability/accesscomputing26-maidr

## Present

Open slides.html in Chrome or Edge. All charts are interactive; use Tab to enter, arrow keys to explore, T for text, B for braille, and S for sound. Physical braille hardware and live screen-reader output must be checked on the presentation setup.

Serve this folder locally if desired:

    python -m http.server 8766 --bind 127.0.0.1

Then open http://127.0.0.1:8766/slides.html

The deck retains the full ProSem material. For a 15-minute talk, prioritize the framing and modalities, one Python/R example, and the Claude.ai demo. Box plots, Shiny implementation details, architecture and the second R example can be skipped.

## Render

The source is `slides.qmd`; the checked-in `slides.html` and `slides_files/` are the published presentation. The original pinned `requirements.txt` is retained. Use a compatible Python environment with py-maidr 1.27.0 and matplotlib 3.10.6, set `QUARTO_PYTHON` to that environment, and run `quarto render slides.qmd`. On Windows, `render.ps1` also finds a project-local `.venv` or the original sibling ProSem environment.

## Claude.ai example

Conversation: https://claude.ai/chat/fbab7127-b46d-4112-8978-bf115b7f7f4d (presenter login).

Initial prompt:

> Chart the number of AccessComputing partners in each partner category from https://accesscomputing.uw.edu/partners.

This workspace has web search disabled and the source domain was unavailable to Claude's code sandbox. A follow-up supplied source-verified counts rather than pretending Claude fetched them: Institutional 77, Organizational 29, Industry 17. The sum is 123 category memberships, not unique partners. Teach Access appears in two categories, so the deduplicated count is 122. These are listed partner entries, not participant counts or program impact metrics. Source snapshot date: October 20, 2026.

Source: https://accesscomputing.uw.edu/partners

The first response used Chart.js without MAIDR. A further prompt explicitly requested the installed maidr skill, and Claude.ai used py-maidr 1.28.0 to export the final Matplotlib binding. The runtime loads maidr.js 4.16.0 from a CDN, so internet access is required.

The exported HTML is kept as Claude.ai generated it; the slide embeds that page using the same helper as the original saved-chart demo. See demo/provenance.json and demo/prompt.txt for provenance.

## Verification

Quarto 1.11.5 rendered slides.html successfully. The saved Claude.ai chart passed the MAIDR static checker with 0 errors and 0 warnings. In the rendered deck, keyboard navigation announced category values 77, 29, and 17. Braille mode was checked in the standalone exported chart. Physical screen-reader audio, tactile hardware and data-dependent sonification were not tested.

## ChatGPT public demo

- Public conversation: https://chatgpt.com/share/6ad7910f-3b5c-83ea-866f-477446569bc3
- Original conversation (presenter login): https://chatgpt.com/c/6ad7903b-e578-83e9-a7b8-dbc7ec1717e6
- Public interactive HTML: https://xabilitylab.ischool.illinois.edu/accesscomputing26-maidr/charts/ai-accesscomputing-partners-chatgpt.html

This was generated in a personal ChatGPT Pro account with GPT-6.1 Sol Light and the official MAIDR skill installed. The same one-line prompt led ChatGPT to fetch the official roster and produce counts 77, 29, 17, with the Teach Access overlap identified. The original HTML preview passed Tab/arrow-key navigation and braille-mode checks.

ChatGPT printed a literal visualize command in its message body. Its public shared view shows the conversation and file card, but the HTML preview did not open there during rehearsal. The slide therefore provides the public conversation link plus the direct interactive HTML fallback. It does not claim a verified interactive chart inside the shared chat.

The exact exported fragment is preserved at demo/chatgpt-output-fragment.html. The chart page adds only a document wrapper and source/overlap notes, not a redraw. Its bundled maidr.js 4.16.0 passed the validator in the same current skill package installed in ChatGPT (0 errors, 0 warnings). The bundle starts in English, uses session-local settings, and has no AI-chat network access. See demo/chatgpt-provenance.json.
