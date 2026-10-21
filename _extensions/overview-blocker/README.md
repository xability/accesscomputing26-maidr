# Overview Blocker

A small Quarto filter that disables Reveal.js overview (the slide-thumbnail grid). It sets the native `overview` option to `false` at render time. No JavaScript, keyboard interception, external dependencies, or fullscreen lock.

## Install

From a project directory, run:

```sh
quarto add ./overview-blocker.zip
```

Or copy this complete folder to `_extensions/overview-blocker/`. Then add to a document or `_quarto.yml`:

```yaml
format: revealjs
filters:
  - overview-blocker
```

## Behavior

- Reveal.js output only; other formats are unchanged.
- Overrides `overview: true` while this filter is active. Remove the filter to restore normal overview behavior.
- Esc and O cannot open overview. Overview gestures and API activation are disabled by the same native option.
- Esc can still dismiss existing menus, dialogs and help overlays. Arrow-key navigation is not remapped.
- Does not change chart bindings, styling, slide dimensions, browser fullscreen, NVDA settings or operating-system shortcuts.
- This sets the initial rendered configuration, not a security boundary: custom JavaScript can reconfigure Reveal later.

Validated with Quarto 1.11.5. Declared engine minimum: Quarto 1.2.0.

## Sources

- https://quarto.org/docs/extensions/filters.html
- https://quarto.org/docs/extensions/distributing.html
- https://quarto.org/docs/extensions/lua-api.html
- The bundled Reveal.js overview controller checks `getConfig().overview` before activating.
