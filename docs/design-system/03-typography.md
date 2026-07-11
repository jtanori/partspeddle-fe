# PPDS Typography

One typography scale serves every surface.

## Scale

```text
Display XL  — 48px / 1.1  / font-display
Display L   — 40px / 1.15 / font-display
Display M   — 32px / 1.2  / font-display
Heading XL  — 28px / 1.2  / font-display
Heading L   — 24px / 1.25 / font-display
Heading M   — 20px / 1.3  / font-display
Heading S   — 18px / 1.35 / font-display
Body L      — 18px / 1.6  / font-sans
Body M      — 16px / 1.6  / font-sans
Body S      — 14px / 1.5  / font-sans
Caption     — 14px / 1.4  / font-sans / medium
Label       — 12px / 1.4  / font-sans / bold uppercase tracking
Mono        — 14px / 1.5  / font-mono
```

## Fonts

- **Display:** Geist, Rajdhani, Oswald (industrial, high contrast).
- **Body:** Inter, Inter Tight (legible, neutral).
- **Mono:** JetBrains Mono (code, VINs, part numbers).

## Usage rules

- Use `font-display` for headings and CTA labels.
- Use `font-sans` for body and captions.
- Use `font-mono` for part numbers, VINs, prices when tabular alignment matters.
- One H1 per page; logical H2/H3 hierarchy.
- Marketplace uses larger display sizes; workspace uses the same scale but starts from Heading M.

## Icons

- **Lucide only.** All icons are rendered from `lucide-react`.
- No custom icon font or SVG sprite sheets are used.
