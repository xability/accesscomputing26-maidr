# 15-minute presentation run of show

Main deck: slides.html. Full original: slides-full.html.

1. 00:00–00:30: Introduction.
2. 00:30–01:30: Design for us.
3. 01:30–02:30: MAIDR and the four modalities.
4. 02:30–03:15: Braille illustration.
5. 03:15–04:00: Five-second sound illustration.
6. 04:00–04:30: Keyboard basics.
7. 04:30–05:15: Python multiline code.
8. 05:15–07:00: Python multiline exploration.
9. 07:00–07:30: R density code.
10. 07:30–08:45: R histogram/density layer exploration.
11. 08:45–09:30: AI skill and shared prompt.
12. 09:30–11:00: Claude.ai example.
13. 11:00–12:45: ChatGPT example.
14. 12:45–13:30: Get started and resources.
15. 13:30–13:45: Acknowledgments.
16. 13:45–15:00: Closing, including up to one minute of transition buffer. Finish early for Q&A if the demos run smoothly.

## AI presentation privacy

- Claude.ai: the native Hide sidebar control was used in the rehearsal browser. Opening the original conversation in a new tab kept the sidebar collapsed. This is a browser/account display preference, not a guarantee enforced by the slide link. It may need to be repeated in another browser/profile or if the sidebar is reopened.
- ChatGPT: the existing shared-conversation URL was verified to show no personal chat-history sidebar, including in a fresh tab.
- No new conversation was published or shared. The original URLs are retained.
- Both slides include a direct chart link with no login and no account sidebar. These are the safest fallback if the external interface changes. Embedded charts are also available without leaving the deck.
- Anonymous ChatGPT inline chart execution was blocked in the earlier rehearsal; do not rely on the shared conversation to execute for every viewer.

## Scope of changes

Only the main presentation route was shortened. Original chart HTML/data and the ProSem repository are unchanged. The R example intentionally retains its histogram under the density curve so Page Up/Page Down can demonstrate layer switching. Saved chart generation sources remain available for the full deck.

## Verification after shortening

- Rendered successfully with the project `render.ps1` environment.
- Main deck: 16 slides, each with timed speaker notes; the full deck is preserved separately.
- All 36 main-deck and 39 full-deck local asset references resolve.
- Browser keyboard checks: Python multiline announced year/index/series values; R announced histogram values and switched to the density layer with Page Up. These are browser checks, not a new NVDA/JAWS or physical audio test.
- `node tests/test-jy-a11y.mjs` passed.
