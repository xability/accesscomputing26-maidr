-- Disable only Reveal.js overview, never the Escape key itself.
-- Quarto passes this metadata to the Reveal.js template after Lua filters.
function Meta(meta)
  if quarto.doc.is_format("revealjs") then
    meta["overview"] = pandoc.MetaBool(false)
  end
  return meta
end
