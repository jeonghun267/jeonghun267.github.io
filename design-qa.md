# OJH portfolio — visual and interaction QA

final result: passed

Scope: the delivered offline-capable frontend prototype, not a deployed service or real-device certification.

## Evidence

- Source visual truth: `references/approved-concept.png`.
- Source dimensions: 1536 × 1024 pixels.
- Implementation: `tests/desktop-final.png`, rendered by Chromium from the complete standalone HTML.
- Desktop viewport: 1536 × 1024 CSS px, deviceScaleFactor 1. Both captures use 1:1 density.
- State: home, all five projects, dark appearance. Implementation capture uses reduced motion to freeze the scene; functional motion on/off was tested separately.
- Combined full-view comparison: `tests/comparison.png` (source and implementation in the same image).
- Combined focused-region comparison: `tests/comparison-details.png` (globe/labels and cards).
- Additional screenshots: `tests/mobile-final.png` (390 × 844), `tests/tablet-final.png` (820 × 1180), `tests/project-dialog.png`, `tests/mobile-project-dialog.png`.
- Full-page visual inspection also covered About, Skills, Contact, and footer.
- Browser behavior checks: `tests/test-results.json`.

## Findings and iteration history

### Fixed — P2: decorative artwork escaped the viewport

Initial 390px rendering extended to 406px due to the terrain layer. The mobile universe now clips its decorative overflow without hiding planet labels.
A subsequent automated boundary pass found 5px overflow at 320px and 27–30px at tablet widths. The compact-phone distant-planet inset and tablet terrain width were corrected.
The final browser pass reports no horizontal overflow at all 12 tested widths: 320, 360, 390, 430, 600, 768, 820, 1024, 1280, 1440, 1536, 1920px.

### Fixed — P2: source lettering and duplicate silhouette in extracted art

The first compositing pass retained faint source labels in the globe/node/background masks and a duplicate observer. Those regions were cleaned and the observer was separated from the terrain and globe.
The rocky skyline mask was revised to remove a visible blue strip. Large background inpainting regions were replaced with smaller lettering masks to preserve planet texture.
Post-fix evidence: the full-view and focused comparisons listed above.

### Fixed — P2: first-fold density and undersized card type

The initial hero pushed project cards below the intended desktop first fold. The desktop header, hero height, globe/node positions, and filter spacing were adjusted. Card title, description, filter, and node-label font sizes were increased.
All five complete project cards now appear in the 1536 × 1024 capture. The additional real filter row is an intentional functional addition, not a source element.

## Required fidelity surfaces

### Fonts and typography

Editable UI text follows the source's sans-serif display hierarchy and restrained tracking. The two-line hero heading, narrow uppercase labels, and project hierarchy are retained.
System font fallbacks are used; no font binaries are included. Exact glyph metrics and headline weight can differ from the generated reference and between operating systems. This is an accepted P3 limitation, not a pixel-perfect font match claim.

### Spacing and layout rhythm

Desktop preserves left introduction, right orbital scene, side quote, and a five-column project grid. The last capture was checked against the source at equal viewport and density.
At narrower widths the scene, navigation, and project grid reflow rather than scaling the desktop screenshot. No persistent control or label is clipped in the inspected mobile/tablet captures.
Below-fold sections are newly implemented extensions because the reference only supplied a homepage first fold.

### Colors and visual tokens

The near-black background, pale blue/lavender typography, cool white primary action, blue globe, and five colored orbital nodes preserve the selected direction.
The composed background is intentionally cleaner/darker than the original flattened image. Hover, focus, selected filter, and modal states are independently styled.

### Image quality and asset fidelity

Major decorative subjects are raster assets extracted from the approved render, not CSS/SVG approximations. Mask artifacts identified in earlier passes were corrected.
The globe and nodes are 2.5D composited imagery; the animated paths are Canvas ornamentation, not a real 3D mesh renderer.
Project thumbnail imagery is explicitly labeled concept art, not product screenshots. The two VR projects currently reuse related concept imagery; replacing it with real project captures is a P3 content-polish item.
Font Awesome SVG icons are used with the original license included.

### Copy and content

Fictional experience counts and performance metrics in the concept were removed. Profile and project links use the user's connected Notion portfolio.
Cards were renamed to actual listed projects. AAC completion and trading performance were not inferred from the concept image.
The immutable source snapshot and content-read boundaries are documented in `SOURCES.md`.

## Primary interactions checked

- Every category filter and reset to all five cards.
- Planet selection filters work and scrolls to the project section.
- Project details, tags, focus area, notes, and configured Notion target.
- Modal close button, Escape, backdrop, focus wrap, and focus return.
- Mobile menu opening and closing after anchor navigation.
- Email mailto target and clipboard-success feedback/fallback path.
- Motion pause, unchanged Canvas while paused, restart, and OS reduced-motion preference.
- Image decoding and JavaScript/browser-console errors.

All assertions in the final test-results file passed. No JavaScript or console errors were recorded in that run.

## Test limitations

Chromium in this environment blocks navigation to localhost and file URLs. The completed self-contained HTML was instead rendered directly in Chromium with `set_content`, including real CSS layout, embedded assets, JavaScript, clicks, keyboard events, dialogs, and screenshots. Browser policy was not modified.
This verifies the rendered frontend but not the deployment transport, real-device hardware performance, Safari behavior, external Notion permissions, or the OS clipboard contents received by another application.
No public deployment, domain connection, backend, or Notion API synchronization has been performed.

## Follow-up polish

- Replace decorative project thumbnails with project-specific production screenshots.
- An actual 3D-model renderer would be a separate implementation phase.
- Check real Android/iOS browsers and public Notion permissions before publishing.

## Implementation checklist

- [x] Selected visual retained as reference.
- [x] Interactive editable HTML/CSS/JavaScript implemented.
- [x] Initial P2 visual and responsive issues fixed and recaptured.
- [x] Full-view and focused source/implementation comparisons inspected.
- [x] Twelve viewport widths checked for overflow.
- [x] Primary interactions and error console checked.
- [x] Standalone HTML, source, assets, licenses, and documentation packaged.
