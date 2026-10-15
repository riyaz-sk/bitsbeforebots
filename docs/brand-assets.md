# B³ — Angular Street

B³ represents the three B’s in Bits Before Bots. The approved direction uses angular graffiti lettering, ivory faces, charcoal outlines, and burnt-orange extrusion.

- `src/assets/brand/b3-angular-street.png`: transparent master for the header, generated with the built-in image generation tool from the approved Angular Street concept. Astro creates small WebP variants at build time.
- `public/favicon.svg`: SVG container embedding a 128px PNG resized directly from the exact header master, with its original transparency. No redrawn paths or font dependency.
- `public/favicon-32.png`: 32px transparent favicon resized directly from the header master.
- `public/apple-touch-icon.png`: 180px transparent touch icon resized directly from the header master.

Header prompt used (built-in tool, transparent background):

> Extract only the large central B³ design from the approved Angular Street board. Preserve the angular graffiti silhouette, capital B’s two open counters, clearly smaller superscript 3, ivory faces, charcoal outlines, burnt-orange beveled extrusion, perspective, and sharp corners. Remove the board heading, bottom favicon tiles, background, and exterior shadows. Transparent alpha, including through open counters. Center the intact mark in a square with a modest margin; no redesign or extra lettering.

All icons preserve the header logo’s exact artwork and palette, including its transparent background and open counters. Only the pixel dimensions change. The SVG is a container for the same artwork, rather than a separate vector interpretation.

Regenerate icons after updating the header master:

```sh
node scripts/generate-brand-icons.mjs
```
