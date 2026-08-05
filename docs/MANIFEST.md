Manifest (`public/manifest.json`) guide

We now use a manifest-driven loader for GeoJSON assets (matching the referenced repo).

- `public/manifest.json` lists:
  - `provinces`: array of province file paths (relative to public)
  - `districts`: mapping where keys are `prov-<id>_districts` and values are arrays of district/local-bodies file paths
  - `municipalities`: mapping for municipality-level files (empty for this dataset)

Regenerating the manifest

Run the included Python script to regenerate the manifest from the current `public/geojson` directory:

```bash
python scripts/generate-manifest.py
```

This will write `public/manifest.json` and print counts per province.

Notes

- The generator uses centroid-in-polygon to assign each local-bodies file to a province. It requires `public/geojson/provinces/*.json` to be present.
- If a district file cannot be assigned, it will be reported under "Unassigned files".
- Keep `public/manifest.json` updated in your CI pipeline when GeoJSON assets change.
