-- Reveal.js only: keep Escape available to menus and overlays.
function Meta(meta)
  if quarto.doc.is_format("revealjs") then
    meta["overview"] = pandoc.MetaBool(false)
    -- Use the JAWS-tested BODY attribute, not an empty marker DIV.
    -- Do not reserve navigation keys if all Reveal keyboard handling is disabled.
    if meta["keyboard"] ~= false then
      quarto.doc.include_file("after-body", "reserved-keys.html")
    end
    quarto.doc.include_file("after-body", "jy-a11y.html")
  end
  return meta
end
