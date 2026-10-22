// Preserve Reveal's controls node and button listeners; remove only its implicit landmark.
(function () {
  "use strict";
  // Custom plugins register before built-ins. Keep the patched Notes factory
  // under this plugin name before Quarto loads its stock RevealNotes global.
  window.JYSpeakerView = window.RevealNotes;
  const reveal = window.Reveal;
  if (!reveal) return;
  function removeControlsLandmark() {
    const controls = reveal.getRevealElement().querySelector("aside.controls");
    if (controls && !controls.hasAttribute("role")) controls.setAttribute("role", "none");
  }
  if (reveal.isReady()) removeControlsLandmark();
  else reveal.on("ready", removeControlsLandmark);
})();
