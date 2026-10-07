# Cosine Tech — Portfolio

A single-page portfolio: web development, photography, videography and graphic design.

## Structure

```
index.html          Page markup (Cosine-Tech.html is an identical copy)
css/style.css       All styles, grouped by section (see table of contents at the top)
js/main.js          All behaviour, grouped by feature (see table of contents at the top)
assets/             Images, logo, flyers, video
```

Keep the `css`, `js` and `assets` folders next to `index.html` when you upload the site.

## Common edits

- **Social links / WhatsApp number** — `js/main.js`, the `LINKS` object near the top.
- **Testimonials** — `index.html`, search for `SAMPLE TESTIMONIALS` and replace the text with real client feedback.
- **Carousel speed** — `js/main.js`, `CAROUSEL_INTERVAL` (milliseconds).
- **Colors** — `css/style.css`, the `:root` block (`--o` orange, `--g` gold, `--k` black).
