# Krillion Unlimited

Name things in 62 categories (12,000+ answers). Obvious answers stay near the surface; niche answers sink to the trench and score more.

- **Quick fire:** a random category, 25 seconds, one answer.
- **Marathon:** name as many as you can in one category.

## Editing the answer lists

Each category is a text file in `data/`. The header sets the name, blurb and group; below `---` is one answer per line, most common first (the order decides how deep each answer sinks). Use `Name|alias|alias` for alternate spellings.

The answer lists live inside `index.html`, so after editing them, rebuild:

```
node tools/build.js
```

The script expects the page at `index.html` next to `data/`.

## AI judge

When the game runs inside Claude's artifact viewer, answers that aren't on a list are sent to Claude, which accepts or rejects them and ranks how obscure they are. On GitHub Pages there's no Claude connection, so only the built-in lists are used.
