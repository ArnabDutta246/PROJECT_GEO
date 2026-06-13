# Quickstart: Project Management — List, Entry & Submit

**Feature**: `005-project-management`  
**Branch**: `005-project-management`  
**Plan**: [plan.md](./plan.md) | **API**: [api.md](../../api.md) §6

---

## Prerequisites

- Node.js 20+
- npm
- Git on branch `005-project-management`
- `environment.useLocalData: false` and valid GEOAPI credentials
- Completed: **US-01** (login), **US-02c** (jurisdiction dropdowns on home)

---

## Install & Run

```powershell
cd d:\PROJECTS\AD\PROJECT_GEO_NEW\ProjectGeo
npm install
npm start
```

App: `http://localhost:4200`

---

## User Journey Walkthrough

```text
1. Login as District Manager or Block Manager (e.g. STMN001)
2. Open /home — Projects sidebar loads from GetGeoProjectList
3. Click Create + (Projects header) or side-nav create icon
4. Complete wizard steps 1–4 (all legacy fields + new contact/jurisdiction fields)
5. Step 5 Review → SUBMIT → InsertUpdateGeoProjectBasicInfo
6. Return to /home — new project appears in sidebar and on map
```

---

## Manual Verification — Phase A (List & Entry)

### Scenario 1: API project list loads

1. Log in; open `/home`
2. Open browser Network tab — expect `GET .../GetGeoProjectList?loginUserId=...&currentPageNo=1&noOfPagesToGet=50&activeYn=Y`
3. **Expect:** Project rows show name, location, scheme type from API
4. **Expect:** No `localStorage.projectData` read in production mode

### Scenario 2: Empty list

1. Use user with zero projects (or filter until empty)
2. **Expect:** Friendly empty message — not a crash

### Scenario 3: Create + navigation

1. Click **Create +** under Projects heading
2. **Expect:** Navigate to `/projects`; jurisdiction from dashboard pre-selected

### Scenario 4: Side-nav create

1. Click create icon in left nav rail
2. **Expect:** Same destination as Create +

### Scenario 5: Filter + search

1. Select district filter — list narrows to matching `gpbi_district_name`
2. Type in search box — client filter under 1 second

---

## Manual Verification — Phase B (Submit)

### Scenario 6: Submit new project

1. Complete step 1 required fields including state/district/block IDs, contact, dates
2. Complete steps 2–4 (beneficiary name required on step 2)
3. On step 5, click **SUBMIT**
4. **Expect:** `POST .../InsertUpdateGeoProjectBasicInfo` with `gpbi_id: 0`
5. **Expect:** Success message; redirect `/home`; new row in list

### Scenario 7: Validation

1. Leave required step-1 field empty; try next
2. **Expect:** Blocked with field error

### Scenario 8: API failure

1. Simulate offline or invalid payload
2. **Expect:** API `message` shown; wizard data preserved

---

## cURL Sanity Check (optional)

```bash
# List
curl -X GET "https://webgap.in/GEOAPI/api/UserDetails/GetGeoProjectList?loginUserId=STMN001&currentPageNo=1&noOfPagesToGet=50&activeYn=Y" -H "accept: text/plain" -H "Authorization: Bearer <token>"

# Submit (see api.md §6.1 for full body)
curl -X POST "https://webgap.in/GEOAPI/api/UserDetails/InsertUpdateGeoProjectBasicInfo" -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -d @project-payload.json
```

---

## Dev fallback

Set `environment.useLocalData: true` to use `LocalProjectRepository` without GEOAPI (development only — not production validation).
