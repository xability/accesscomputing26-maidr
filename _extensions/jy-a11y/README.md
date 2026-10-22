# jy-a11y

Quarto accessibility filter for Reveal.js presentations. Renamed from overview-blocker. Version 1.1.1 fixes the JAWS declaration target: BODY itself, not a descendant marker.

## Install

Run in your project directory:

~~~sh
quarto add ./jy-a11y.zip
~~~

Or copy this complete directory to _extensions/jy-a11y/. Enable in your document or _quarto.yml:

~~~yaml
format: revealjs
filters:
  - jy-a11y
~~~

When upgrading, replace overview-blocker in the filter list with jy-a11y. The old extension folder can be removed.

## Behavior

- Reveal.js only. Ordinary HTML, Word and other outputs are unchanged.
- Sets overview: false at render time, even if overview: true was specified. Esc/O cannot open the thumbnail grid; Esc remains available to dismiss menus/help.
- A small inline script applies Reveal.configure({keyboard: {...existing, 72: null}}) when Reveal is ready. H no longer navigates backwards. This does NOT reserve H for the web app, so JAWS can continue using H for heading navigation in virtual-cursor mode.
- Preserves other custom key bindings, keyboardCondition, arrow keys, and native J/K/N/P behavior. In linear mode J/N go forward and K/P go backward; outside linear mode J/K retain down/up behavior.
- If keyboard: false is specified, navigation stays disabled and the filter does not insert the JAWS reserved-key declaration.
- Sets the reserved-key JSON directly on document.body using an inline script, matching the JAWS-tested xaringan implementation. Existing valid BODY mappings are merged. The resulting element is:

~~~html
<body data-at-shortcutkeys='{"j":"Next slide or navigate down","k":"Previous slide or navigate up","n":"Next slide","p":"Previous slide"}'> ... </body>
~~~

## JAWS setup and limitations

Enable **Allow Web Application Reserved Keystrokes** in JAWS Settings Center or Quick Settings (wording may vary by version). With this setting enabled, JAWS can pass declared keys to the web application instead of its own quick-navigation commands. This is a page-wide, nonstandard JAWS convention, NOT a per-element focus boundary or an ARIA attribute. The attribute must be on BODY itself; placing it on an empty DIV inside BODY failed in user testing. Merely adding the attribute cannot force a user's screen reader to surrender keys.

Only unmodified lowercase j/k/n/p are declared. H, Shift+H and other screen-reader commands are not reserved by this filter. No NVDA/VoiceOver compatibility claim is made. Child iframe documents are not modified, and chart shortcuts/handlers are untouched. In-page widgets should continue to manage their own keyboard events normally.

No global keydown handler, focus trap, forced application role, fullscreen lock, or screen-reader setting changes are installed. Later custom JavaScript may reconfigure Reveal. Reveal's stock help text may still list H/Overview even though their navigation actions are disabled.

## Validation

Tested with Quarto 1.11.5 and its Reveal.js 5.1.0 bundle. The declared Quarto minimum is not a separately tested compatibility guarantee.

~~~powershell
./tests/test-jy-a11y.ps1
node ./tests/test-jy-a11y.mjs
~~~

Rendering tests cover defaults, explicit overview true/false, disabled keyboard, self-contained HTML, non-Reveal output and project-level filters. Runtime tests cover H, existing bindings, keyboard:false and ready timing. Browser checks validate the HTML attribute and key behavior, not JAWS interception. Actual JAWS and NVDA operation still requires testing on the presentation machine.

## 1.1.1 correction

The 1.1.0 empty DIV declaration was present in the DOM but the user reported that JAWS did not pass keys, despite the setting working on other sites. JooYoung Seo's xaringan PR #262 documents the same placement failure and a BODY-targeted fix; his March 2022 comment confirms JAWS testing there. This version adopts that implementation pattern. Browser checks confirm the BODY declaration and native key handling, not current JAWS interception. A new JAWS test is still needed before calling the issue resolved.

## Sources

- JAWS-tested BODY placement and user verification: https://github.com/yihui/xaringan/pull/262
- Working implementation: https://github.com/yihui/xaringan/blob/e8753b950ba8ca00d4b46f0be50561b8ea9537f8/inst/rmarkdown/templates/xaringan/resources/js/after.js

- Freedom Scientific, JAWS 16, Web Application Reserved Keystrokes: https://support.freedomscientific.com/downloads/jaws/JAWSWhatsNew?version=16
- Freedom Scientific, JAWS 2019, Chrome reserved-key support: https://support.freedomscientific.com/downloads/jaws/JAWSWhatsNew?version=2019
- Chromium, page-wide JSON dictionary attribute: https://chromium.googlesource.com/chromium/src/+/e7eb5511a93f74f5857cb56378737aad3ae850f7%5E%21/
- Reveal.js keyboard overrides: https://revealjs.com/keyboard/
- Quarto Lua includes: https://quarto.org/docs/extensions/lua-api.html
