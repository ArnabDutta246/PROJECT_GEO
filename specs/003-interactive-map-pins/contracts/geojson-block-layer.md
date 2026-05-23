# Contract: ARUNACHAL_PRADESH_BLOCK GeoJSON Layer

**Feature**: `003-interactive-map-pins`  
**Source file**: [`src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson`](../../../src/app/geojson/ARUNACHAL_PRADESH_BLOCK.geojson)  
**Served at**: `/geojson/ARUNACHAL_PRADESH_BLOCK.geojson` (via `angular.json` asset mapping)  
**Loader**: `GeoJsonFileRepository` → `LoadBlockBoundariesUseCase`

---

## File Format

```json
{
  "type": "FeatureCollection",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features": [
    {
      "type": "Feature",
      "properties": { ... },
      "geometry": { "type": "Polygon" | "MultiPolygon", "coordinates": [...] }
    }
  ]
}
```

**CRS:** WGS84 (EPSG:4326) — coordinates are `[longitude, latitude]` per GeoJSON spec. Leaflet adapter MUST swap to `[lat, lng]` when plotting.

---

## Identity Properties (required for matching)

| Property | Example | Purpose |
|----------|---------|---------|
| `Mouza Name` | `"MIGGING"` | **Primary block match key** ↔ GEOAPI block dropdown |
| `DISTRICT_N` | `"UPPER SIANG"` | **Primary district match key** ↔ GEOAPI district dropdown |
| `NAME` | `"Migging"` | Display label (mixed case) |
| `SID` | `"12"` | State ID (Arunachal Pradesh) |
| `DID` | `"09"` | District numeric code |
| `CENSUS_COD` | `1209000200000000` | Stable boundary ID |
| `OBJECTID` | `9` | Fallback ID |

**Matching rule:** Compare `Mouza Name` and `DISTRICT_N` to dropdown labels using `normalizeGeoName()` (trim, uppercase, collapse whitespace).

---

## Census Properties (read-only for US-03; used by US-04a)

| Property | Type | Description |
|----------|------|-------------|
| `TOT_P` | number | Total population |
| `TOT_M` | number | Male population |
| `TOT_F` | number | Female population |
| `P_SC` | number | Scheduled Caste population |
| `M_SC`, `F_SC` | number | SC by gender |
| `P_ST` | number | Scheduled Tribe population |
| `M_ST`, `F_ST` | number | ST by gender |
| `No_HH` | number | Household count |
| `P_LIT`, `M_LIT`, `F_LIT` | number | Literacy counts |

---

## Sample Feature

```json
{
  "type": "Feature",
  "properties": {
    "Mouza Name": "MIGGING",
    "DISTRICT_N": "UPPER SIANG",
    "NAME": "Migging",
    "SID": "12",
    "TOT_P": 1223,
    "TOT_M": 745,
    "TOT_F": 478
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[94.5, 28.2], ...]]
  }
}
```

---

## Repository Load Contract

```typescript
// GeoJsonFileRepository
GET /geojson/ARUNACHAL_PRADESH_BLOCK.geojson
  → 200: FeatureCollection parsed to GeoBoundary[]
  → 404/500: ApplicationError('Unable to load map boundaries')
```

**Caching:** In-memory cache after first successful fetch for session lifetime.

---

## Filter Contract

| Filter context | GeoJSON filter expression |
|----------------|---------------------------|
| No district selected (State Manager) | All features where `SID === '12'` |
| District selected | `normalizeGeoName(DISTRICT_N) === normalizeGeoName(selectedDistrict)` |
| Block selected | Above + `normalizeGeoName(Mouza Name) === normalizeGeoName(selectedBlock)` |

---

## Viewport Bounds Contract

`MapAdapter.fitBounds()` receives bounds computed from filtered feature geometries:

1. Iterate matching features
2. Extend bounds with each polygon's coordinate ring
3. Pass `{ southWest: [minLat, minLng], northEast: [maxLat, maxLng] }` to adapter

**Padding:** 20px on all sides when fitting.

---

## Angular Asset Configuration

Add to `angular.json` → `projects.ProjectGeo.architect.build.options.assets`:

```json
{
  "glob": "**/*",
  "input": "src/app/geojson",
  "output": "/geojson"
}
```

**Do not** duplicate file to `src/assets/geojson/` — single source at `src/app/geojson/`.

---

## Leaflet Layer Rendering

```typescript
L.geoJSON(filteredFeatures, {
  style: { color: '#3388ff', weight: 2, fillOpacity: 0.1 },
  onEachFeature: (feature, layer) => {
    layer.on('click', () => onBlockClick(feature.properties));
  }
});
```

Project pins render **above** the block layer (higher z-index pane or added after block layer).

---

## Error Handling

| Condition | UI behavior |
|-----------|-------------|
| GeoJSON fetch fails | Map base tiles still render; error banner; no block outlines |
| Zero matching blocks for filter | Fit to AP default center; show info message |
| Feature missing geometry | Skip feature; log in dev console |
