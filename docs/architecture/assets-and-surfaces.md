# Asset templates and rendering

**Current:** `components/marketing/asset-plates.tsx` draws one lid and one chest using local constants. No template registry, real asset rows or selectable inventory exists. “MM” labels are SVG coordinate values, not validated manufacturing measurements.

**Proposed:** a versioned catalogue of human-authored SVG views and validated coordinate manifests. Template versions own surface definitions; surfaces own spot definitions. Assets instantiate allowed inventory spots. See [database](database.md) and [ADR-003](../decisions/ADR-003-inventory-and-transaction-boundaries.md).

Repository SVG/manifest files own canonical geometry; database catalogue rows identify immutable version/hash and surface/spot keys for foreign keys. Seed the reviewed manifest deterministically and verify stored/build hashes; reject mismatches. Avoid independently editable geometry copies. Keep old versions for rendering orders. Seller uploads cannot replace canonical geometry.

Launch families: MacBook and Jersey/T-shirt. First active variants: validated exterior lid and garment chest. Back/left sleeve/right sleeve can follow physical fit/printing/rights checks without another subsystem. No palm-rest inventory solely because the marketing ticker mentions it.

Manifest fields: template key/version, family/variant, viewBox, renderer reference/hash, surface key/label/view, spot key/label/coordinates, validated physical dimensions/units, conflict key, creative restrictions and activation flag. Illustration geometry and print dimensions are separate. Avoid overlapping active regions; an entire-front placement and chest placement must share a conflict resource if introduced later.

Renderer inputs: template version, selected/available/booked spot IDs, optional approved creative. A sibling text list provides names, prices, selection and actions for keyboard/screen-reader users. Surface tabs are needed only for multiple activated views. Preserve selection on viewport changes and communicate availability in text, not color alone.

Artwork is untrusted media: accept a small validated raster set initially, keep originals private, approve exact creative version before production, and render bounded sanitized previews. The renderer owns presentation, never pricing, availability, ownership or payment state.

Tests: manifest consistency, geometry bounds, immutable versions, asset/definition match, accessible selection, mobile hit targets and unavailable states. Physical trials validate fit, adhesion/print quality, removal, cost and lead time. No AI canonical geometry, drag sizing, 3D or generic editor.
