# Speaker view backport

notes.js is the exact Quarto 5.1.0 notes-plugin rebuild from quarto-dev/quarto-cli PR #15164 (commit 7078e2e88a514c000165352303f3c3fea2b07740), based on hakimel/reveal.js PR #3953. speaker-view.html is the corresponding readable template. The upstream MIT license is included.

Quarto loads custom plugin scripts before its stock Notes script, but registers custom plugins before built-ins. controls.js retains the patched factory as JYSpeakerView. Its native id is notes, so Reveal registers and initializes the patched factory first and skips the duplicate stock notes registration. Reveal 5.1.0 emits its standard duplicate-notes registration warning; this is intentional and only one Notes instance is initialized. No popup polling, window.open interception, or property-setter hooks are used. The notes bundle embeds its speaker-view HTML, so it also works in self-contained output.

controls.js sets role=none only on an unannotated legacy aside.controls after Reveal is ready. This has the same landmark-removal effect as the upstream div wrapper, without replacing the node or breaking Reveal's internal references and button listeners. New div.controls wrappers and explicit author roles are left alone. This runs in the presentation and both receiver frames.

To update, build the approved source patch in a clean reveal.js 5.1.0 tree with Quarto's existing backports using the official gulp build, then copy plugin/notes/notes.js and speaker-view.html together. Do not manually edit minified code.

Sources: https://github.com/hakimel/reveal.js/pull/3953 and https://github.com/quarto-dev/quarto-cli/pull/15164
