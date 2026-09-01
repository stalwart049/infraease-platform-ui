# InfraEase Platform UI

# Build InfraEase Enterprise Service Management Platform — Form View & List View Frontend

Build the frontend for **InfraEase**, an enterprise service management platform.

**Important:** For this phase, build ONLY:

1. Form View
2. List View
3. Global Navigation Bar / Menu System

Do NOT build unrelated modules, dashboards, portals, reports, analytics, or backend services.

The frontend must be designed as a **reusable metadata-driven platform UI**, similar in overall interaction philosophy to enterprise platforms such as ServiceNow, but DO NOT copy ServiceNow's visual assets, branding, CSS, or exact UI design. InfraEase must have its own modern enterprise identity.

---

# 1. Technology & Architecture

Use:

* React
* React Router
* Modern JavaScript/TypeScript
* Bootstrap or a clean enterprise UI component system
* Responsive design
* Reusable components
* API-driven metadata
* No hard-coded table-specific forms or lists

The application should be structured so that the same Form View and List View components can render ANY table based on metadata returned from APIs.

For example:

```text
/users
/incidents
/requests
/assets
/departments
/custom_table
```

should all be able to use the same reusable ListView and FormView components.

---

# 2. Overall InfraEase UI

Create a professional enterprise application layout.

Design principles:

* Premium
* Modern
* Clean
* Minimal
* Enterprise-grade
* Spacious
* Fast
* Highly usable
* Responsive
* Desktop-first but tablet/mobile compatible

Avoid excessive rounded cards, gradients, huge shadows, excessive animations, or a consumer-app appearance.

The interface should feel like a serious enterprise platform.

---

# 3. GLOBAL NAVIGATION BAR

Create a fixed/top application navbar.

## Left side

Display:

* InfraEase logo
* Application/menu navigation

Example structure:

```text
[InfraEase]  All  Favorites  Applications  ...
```

The actual menus MUST NOT be hard-coded.

Menus and menu items must come from an API response.

Example API response:

```json
[
  {
    "id": "service_management",
    "label": "Service Management",
    "icon": "layers",
    "children": [
      {
        "id": "incidents",
        "label": "Incidents",
        "icon": "alert-circle",
        "route": "/list/incident"
      },
      {
        "id": "requests",
        "label": "Requests",
        "icon": "clipboard",
        "route": "/list/request"
      }
    ]
  }
]
```

Support unlimited/multiple levels:

```text
Application
 └── Module
      └── Category
           └── Table
```

Do not assume a maximum depth.

---

# 4. MENU DROPDOWNS

Clicking a navbar menu should open its menu as a dropdown/popover.

Example:

```text
Service Management ▼

[ Search menu items... ]

Incidents
Requests
Problems
Changes
Assets
Knowledge
...
```

## Menu search

Every menu dropdown must contain a search box.

The search box should dynamically filter the menu items.

For nested menus:

```text
Search...

Service Management
  Incidents
  Requests
  Problems

Asset Management
  Hardware
  Software
  Contracts
```

Search should work across nested menu items.

---

# 5. PIN MENU AS SIDEBAR

Every menu dropdown should have a **Pin** option.

Example:

```text
Service Management
---------------------
📌 Pin menu
---------------------
Incidents
Requests
Problems
Changes
```

When the user pins a menu:

* The dropdown should transform into/open as a sidebar panel.
* The selected menu becomes the active sidebar.
* If another menu is already pinned, automatically unpin/replace it.
* ONLY ONE menu can be pinned at a time.

Example:

```text
┌───────────────────────┐
│ Service Management    │
│                       │
│ 🔎 Search             │
│                       │
│ Incidents             │
│ Requests              │
│ Problems              │
│ Changes               │
└───────────────────────┘
```

Clicking another menu's Pin should replace the existing pinned sidebar.

Provide an Unpin action.

Persist the pinned menu in frontend state/local storage so refreshing the application does not unexpectedly lose it.

---

# 6. USER PROFILE MENU

On the right side of the navbar display:

* Notifications icon
* User/profile icon
* User name
* Optional organization/application information

Clicking the profile icon should open a dropdown containing:

```text
My Profile
Preferences
Personalization
Notifications
Settings
Keyboard Shortcuts
Help
Logout
```

These should be represented using appropriate icons.

The dropdown should be clean and enterprise-style.

Settings/personalization options should live inside this profile dropdown.

---

# 7. ROUTING

Implement routes such as:

```text
/list/:tableName
/form/:tableName
/form/:tableName/:recordId
```

For example:

```text
/list/incident
/form/incident/new
/form/incident/INC0010001
```

The views must use the `tableName` and metadata/API response to dynamically construct the UI.

---

# 8. FORM VIEW

Create a reusable dynamic FormView component.

The form must obtain its structure and fields from API metadata.

Example conceptual metadata:

```json
{
  "table": {
    "name": "incident",
    "label": "Incident"
  },
  "record": {
    "sys_id": "abc123",
    "number": "INC0010001"
  },
  "sections": [
    {
      "id": "details",
      "label": "Details",
      "fields": []
    },
    {
      "id": "assignment",
      "label": "Assignment",
      "fields": []
    }
  ],
  "fields": []
}
```

Do NOT hard-code fields such as first_name, email, mobile, etc.

The component should render whatever fields the API provides.

---

# 9. FORM HEADER

At the top of the form create a form header.

Left side:

```text
☰   TABLE NAME
    RECORD ID
```

Example:

```text
☰   INCIDENT
    INC0010001
```

Requirements:

* Hamburger/context-menu icon
* Table name in bold
* Current record ID below table name
* Proper typography hierarchy
* Header should remain visually distinct from the form body

If this is a new record:

```text
☰   INCIDENT
    New Record
```

---

# 10. FORM HEADER BUTTONS

On the right side of the form header provide configurable buttons.

Example:

```text
Save
Save & New
Cancel
```

Buttons should be driven by configuration where possible.

Use proper icons.

Example:

* Save → save icon
* Cancel → x icon
* New → plus icon
* Refresh → refresh icon

The buttons should be reusable and not hard-coded specifically for one table.

---

# 11. FORM CONTEXT MENU

Clicking the hamburger icon should open a context menu.

Example:

```text
New
Save
Save & New
Refresh
Delete
Configure Form
Personalize
```

Only display actions available from API/action metadata.

The context menu should be reusable.

---

# 12. FORM FIELDS

Support all common field types.

At minimum:

### Text

```text
First Name
[________________]
```

### Email

```text
✉ Email
[________________]
```

### Mobile / Phone

```text
☎ Mobile
[________________]
```

### Number

```text
Number
[________________]
```

### Password

```text
Password
[________________]
```

### Date

Use a proper date picker.

### Date/Time

Use a proper date-time picker.

### Boolean

Use an appropriate checkbox/toggle.

### Dropdown

Example:

```text
Status
[ None             ▼ ]
```

The dropdown MUST support a `None` option where allowed.

Do not automatically select the first option.

Example:

```text
None
Open
In Progress
Resolved
Closed
```

---

# 13. REFERENCE / LOOKUP FIELD

Reference fields are extremely important.

Create a reusable `ReferenceField` component.

Example:

```text
Assigned To

[ John Smith                  🔍 ]
```

The input should behave like a lookup/reference field.

Requirements:

* User can type into the field
* Show matching records while typing
* Display suggested records in a dropdown
* Support loading state
* Support no-results state
* Support keyboard navigation
* Support selecting a result
* Store/reference the actual record ID separately from display value
* Display the record's configured display field
* Support API-driven lookup

Example lookup response:

```json
[
  {
    "sys_id": "123",
    "display_value": "John Smith"
  },
  {
    "sys_id": "456",
    "display_value": "Jane Doe"
  }
]
```

The selected reference should conceptually contain:

```javascript
{
  sys_id: "123",
  display_value: "John Smith"
}
```

---

# 14. REFERENCE PREVIEW BUTTON

Every reference field should have a button on the right side.

Example:

```text
Assigned To
┌──────────────────────────────┐
│ John Smith              👁   │
└──────────────────────────────┘
```

Clicking the preview button should open a record preview.

The preview can initially be implemented as a modal/drawer.

Example:

```text
┌──────────────────────────────────┐
│ User                             │
│ John Smith                  ✕    │
├──────────────────────────────────┤
│ Email                            │
│ john@example.com                 │
│                                  │
│ Mobile                           │
│ +91 XXXXX XXXXX                  │
│                                  │
│ Department                       │
│ Engineering                      │
├──────────────────────────────────┤
│ Open Record                      │
└──────────────────────────────────┘
```

The preview data must be retrieved from the server using the reference record ID.

---

# 15. FIELD ICONS

Use meaningful icons where appropriate.

Examples:

* Email → mail
* Mobile → phone
* Address → map-pin
* User → user
* Department → building
* Date → calendar
* Time → clock
* URL → link
* Attachment → paperclip
* Reference → search/database/link
* Description → file-text

Do NOT put icons on every field if doing so reduces readability.

Icons should be subtle and consistent.

---

# 16. FORM LAYOUT

The form must support multiple sections.

Example:

```text
┌────────────────────────────────────────────┐
│ Details │ Assignment │ Additional │ Notes │
├────────────────────────────────────────────┤
│                                            │
│ Fields belonging to selected section       │
│                                            │
└────────────────────────────────────────────┘
```

## First section

The first section should be displayed by default.

Example:

```text
Details
--------------------------------

Number        [INC0010001]
Short Desc.   [________________]
Description   [________________]
Status        [Open ▼]
Priority      [High ▼]
```

Other sections should be displayed as tabs.

Example:

```text
[Details] [Assignment] [Additional] [Notes]
```

When the user clicks a tab:

* Display fields belonging to that section
* Hide fields from other sections
* Preserve entered values
* Do not reload the entire form unnecessarily

The tabs and sections MUST come from API metadata.

---

# 17. FORM FIELD METADATA

The form renderer should support metadata similar to:

```json
{
  "name": "assigned_to",
  "label": "Assigned To",
  "type": "reference",
  "reference_table": "sys_user",
  "display_field": "name",
  "mandatory": true,
  "readonly": false,
  "visible": true
}
```

Support:

```text
type:
text
textarea
email
phone
number
date
datetime
boolean
select
reference
password
url
```

Architect the renderer so more field types can easily be added later.

---

# 18. VALIDATION

Support metadata-driven validation.

Fields should support:

* Required
* Read-only
* Hidden
* Minimum length
* Maximum length
* Pattern/regex where supplied
* Data type validation

Display validation errors clearly below the relevant field.

Example:

```text
Email
[invalid@email]

Please enter a valid email address.
```

Do not rely solely on browser-native validation.

---

# 19. FORM SUBMISSION

The FormView MUST be capable of submitting the form to the server.

Create a clean API abstraction such as:

```javascript
createRecord(tableName, formData)
updateRecord(tableName, recordId, formData)
getRecord(tableName, recordId)
getFormMetadata(tableName)
```

Example conceptual endpoints:

```text
GET    /api/table/{tableName}/form
GET    /api/table/{tableName}/{recordId}
POST   /api/table/{tableName}
PUT    /api/table/{tableName}/{recordId}
```

Do not hard-code these if an API configuration layer is appropriate.

On Save:

1. Validate the form.
2. Build the payload from fields.
3. Send the payload to the server.
4. Show loading state.
5. Prevent duplicate submissions.
6. Handle success.
7. Handle errors.
8. Update/navigate appropriately after successful submission.

Example success notification:

```text
✓ Record saved successfully
```

Example server error:

```text
Unable to save record.
Please correct the highlighted fields.
```

---

# 20. UNSAVED CHANGES

Track dirty form state.

If the user changes fields and attempts to leave the page:

```text
Unsaved Changes

You have unsaved changes.
Are you sure you want to leave?

[Stay] [Discard Changes]
```

---

# 21. FORM LINKS

At the bottom of the form support related links.

Example:

```text
Related Links
--------------------------------

Open Activity
View Attachments
View Related Records
Show History
```

These links should come from API metadata.

Use proper icons and subtle styling.

---

# 22. LIST VIEW

Create a reusable dynamic ListView.

Example:

```text
┌───────────────────────────────────────────────────────┐
│ ☰  INCIDENT                              New Refresh  │
│                                                       │
│ [Search / Filter...]                                  │
├───────────────────────────────────────────────────────┤
│ □ │ Number      │ Short Description │ Status │ Owner  │
├───────────────────────────────────────────────────────┤
│ □ │ INC001      │ Login issue       │ Open   │ John   │
│ □ │ INC002      │ Email issue       │ Closed │ Jane   │
└───────────────────────────────────────────────────────┘
```

---

# 23. LIST HEADER

Left:

```text
☰   TABLE NAME
```

Table name should be bold.

Right side:

```text
New
Refresh
Export
```

Buttons should be configurable and metadata/API driven where possible.

Use proper icons.

---

# 24. LIST CONTEXT MENU

Clicking the hamburger icon should open a context menu.

Example:

```text
New
Refresh
Configure List
Personalize
Export
Import
```

Actions should be metadata-driven.

---

# 25. LIST COLUMNS

Columns must come from API metadata.

Example:

```json
{
  "columns": [
    {
      "name": "number",
      "label": "Number",
      "type": "text"
    },
    {
      "name": "short_description",
      "label": "Short Description",
      "type": "text"
    },
    {
      "name": "assigned_to",
      "label": "Assigned To",
      "type": "reference"
    },
    {
      "name": "state",
      "label": "State",
      "type": "select"
    }
  ]
}
```

Do not hard-code columns.

---

# 26. RECORD SELECTION

Every row must have a checkbox.

Header must have a "select all" checkbox.

Support:

```text
□ Select all
□ Record 1
□ Record 2
□ Record 3
```

When selecting all:

* Select all records on the current page initially.
* Clearly indicate the selection count.
* Structure the state so global/all-result selection can be supported later.

Example:

```text
3 records selected
```

---

# 27. DOUBLE CLICK TO EDIT

Users should be able to edit a record by double-clicking a cell.

Example:

```text
Double click:

Open
```

The cell should enter an inline editing state.

Support editing for ALL supported field types.

---

# 28. INLINE EDITING — TEXT

Example:

```text
Short Description

[Login problem reported        ]
```

Allow:

* Enter → save
* Escape → cancel
* Click elsewhere → configurable save/cancel behavior

Show loading state while saving.

---

# 29. INLINE EDITING — TEXTAREA

If the column is textarea/long text:

* Use an appropriate inline textarea/popover editor.
* Allow multiline text.
* Do not force a single-line input.

---

# 30. INLINE EDITING — DROPDOWN

For dropdown fields:

```text
[Open ▼]
```

Options should come from API metadata.

Support:

```text
None
Open
In Progress
Resolved
Closed
```

---

# 31. INLINE EDITING — REFERENCE

For reference columns:

```text
[John Smith             🔍]
```

Reuse the same ReferenceField component used by FormView.

It should:

* Search server-side
* Display suggestions
* Allow selecting a record
* Store the record ID
* Display the configured display value
* Support preview

---

# 32. INLINE EDITING — OTHER FIELD TYPES

Support:

* Text
* Textarea
* Number
* Email
* Phone
* Date
* DateTime
* Boolean
* Dropdown
* Reference
* URL

Create a reusable `InlineFieldEditor`.

Do not create separate unrelated implementations for every table.

---

# 33. SERVER-SIDE SORTING

Sorting MUST happen on the server.

When clicking a column header:

```text
Number ↑
```

send sorting information to the API.

Example:

```text
GET /api/table/incident?sortBy=number&sortOrder=asc&page=0&pageSize=10
```

Then:

```text
Number ↓
```

for descending.

Do NOT fetch all records and sort them in the browser.

---

# 34. SERVER-SIDE PAGINATION

Pagination MUST be server-side.

The server should return something conceptually like:

```json
{
  "content": [],
  "page": 0,
  "pageSize": 10,
  "totalElements": 100,
  "totalPages": 10
}
```

The frontend must use the server response.

Do not load all 100 records into the browser.

---

# 35. PAGINATION UI

Use this style:

```text
Showing 10 - 20 of 100

< Previous    1  2  3  4  5    Next >
```

For the first page:

```text
Showing 1 - 10 of 100
```

For the last page:

```text
Showing 91 - 100 of 100
```

Correctly calculate the displayed range using the server response.

Support configurable page sizes:

```text
10
20
50
100
```

Changing page size should make a new server request.

---

# 36. LIST SEARCH / FILTER

Provide a search/filter area above the table.

Example:

```text
[ 🔎 Search records... ]    Filter
```

The architecture should allow server-side filtering.

Do not perform filtering only on the currently loaded records.

Prepare the API abstraction for:

```text
GET /api/table/{tableName}?query=...&page=...&pageSize=...
```

---

# 37. LIST LOADING STATE

During API calls:

* Show a professional loading indicator/skeleton.
* Do not make the entire application appear frozen.
* Keep the header available where possible.

---

# 38. LIST EMPTY STATE

If there are no records:

```text
No records found

Try changing your search or filter.
```

If the table has no records at all:

```text
No records available

[ + New Record ]
```

---

# 39. LIST ERROR STATE

If the API fails:

```text
Unable to load records.

[ Retry ]
```

Do not display raw backend stack traces.

---

# 40. RESPONSIVE DESIGN

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile

For small screens:

* Table should intelligently adapt.
* Allow horizontal scrolling when required.
* Header buttons should collapse appropriately.
* Forms should switch from multi-column layouts to single-column layouts.
* Menu/sidebar should become an appropriate mobile drawer.

Do not destroy functionality on mobile.

---

# 41. API-DRIVEN ARCHITECTURE

This is extremely important.

The frontend should NOT be built specifically for:

```text
Incident
User
Department
```

Instead build generic components:

```text
AppShell
Navbar
MenuDropdown
PinnedSidebar
ProfileDropdown

ListView
ListHeader
ListTable
ListColumn
InlineFieldEditor
ReferenceField
Pagination
FilterBar

FormView
FormHeader
FormSectionTabs
FormField
ReferenceField
RecordPreview
RelatedLinks
FormActions
```

The metadata/API determines what they render.

---

# 42. SUGGESTED PROJECT STRUCTURE

Use a clean architecture such as:

```text
src/
 ├── components/
 │    ├── layout/
 │    │    ├── Navbar
 │    │    ├── MenuDropdown
 │    │    ├── PinnedSidebar
 │    │    └── ProfileMenu
 │    │
 │    ├── form/
 │    │    ├── FormView
 │    │    ├── FormHeader
 │    │    ├── FormSectionTabs
 │    │    ├── FormField
 │    │    ├── ReferenceField
 │    │    ├── RecordPreview
 │    │    └── RelatedLinks
 │    │
 │    └── list/
 │         ├── ListView
 │         ├── ListHeader
 │         ├── ListTable
 │         ├── ListColumn
 │         ├── InlineFieldEditor
 │         ├── FilterBar
 │         └── Pagination
 │
 ├── services/
 │    ├── api.js
 │    ├── formService.js
 │    ├── listService.js
 │    └── menuService.js
 │
 ├── hooks/
 │    ├── useForm
 │    ├── useList
 │    ├── useReference
 │    └── useMenu
 │
 ├── pages/
 │    ├── FormPage
 │    └── ListPage
 │
 └── routes/
```

The exact structure can differ if there is a better implementation, but maintain clear separation between UI, API services, state, and metadata.

---

# 43. MOCK API LAYER

Since the backend may not yet be connected, create a clean mock API/service layer.

IMPORTANT:

Do not put fake API calls directly inside UI components.

Instead:

```javascript
listService.getRecords(...)
formService.getRecord(...)
formService.saveRecord(...)
menuService.getMenus(...)
referenceService.search(...)
```

This allows the real InfraEase backend to replace the mock implementation later without rewriting the UI.

Provide realistic mock data so the Form View and List View can be demonstrated.

---

# 44. STATE MANAGEMENT

Keep state organized.

At minimum handle:

### Form

```text
formData
originalData
dirty
loading
saving
errors
activeSection
```

### List

```text
records
columns
loading
error
page
pageSize
totalElements
sortBy
sortOrder
selectedRecords
editingCell
filters
```

### Navigation

```text
menus
openMenu
pinnedMenu
profileMenu
```

---

# 45. UX DETAILS

Add polished enterprise UX details:

* Tooltips for unfamiliar icons
* Keyboard accessible controls
* Visible focus states
* Proper disabled states
* Loading states
* Error states
* Success notifications
* Confirmation dialogs for destructive operations
* Consistent spacing
* Consistent typography
* Consistent icons
* Proper hover states
* Proper active states

Avoid unnecessary animations.

---

# 46. ACCESSIBILITY

Follow accessible UI practices:

* Buttons should have accessible labels
* Icons should not be the only accessible indication of an action
* Keyboard navigation should work
* Dropdowns should be keyboard accessible
* Modal/dialog should trap focus appropriately
* Form labels must be associated with inputs
* Validation messages should be accessible

---

# 47. VISUAL DESIGN

Create a distinct InfraEase visual identity.

Use:

* Clean white/light application surfaces
* Subtle borders
* Professional typography
* Controlled use of brand accent color
* Compact but comfortable enterprise tables
* Clear hierarchy
* Subtle hover states
* Minimal shadows
* Professional iconography

The UI should feel comparable in quality to modern enterprise software such as:

* Microsoft
* Salesforce
* Atlassian
* ServiceNow

but must have its own design and MUST NOT copy any of their exact layouts, branding, assets, or styling.

---

# 48. IMPORTANT IMPLEMENTATION RULES

### Rule 1 — No hard-coded table UI

Do not create separate components such as:

```text
IncidentForm
IncidentList
UserForm
UserList
```

Instead:

```text
FormView
ListView
```

must render everything dynamically from metadata.

### Rule 2 — API first

Assume all:

* menu data
* fields
* sections
* columns
* choices
* reference data
* actions
* related links

come from APIs.

### Rule 3 — Server-side list operations

Sorting, pagination and filtering must be designed for server-side APIs.

### Rule 4 — Reuse components

The same:

```text
ReferenceField
```

must work in:

* FormView
* ListView inline editing
* Reference preview

### Rule 5 — Do not expose backend implementation details

Only build the frontend API contract.

### Rule 6 — No unnecessary features

Do not build dashboards, reports, service portal, workspace, workflow designer, query builder, etc. in this phase.

Those will be added later.

---

# 49. DEMONSTRATION DATA

Create realistic sample metadata for at least one table, for example `incident`.

Example fields:

```text
Number
Short Description
Description
Caller
Category
Subcategory
Priority
State
Assigned To
Assignment Group
Email
Mobile
Opened
Due Date
```

Use multiple sections:

```text
Details
Assignment
Additional Information
Notes
```

The sample should demonstrate:

* Text
* Textarea
* Email
* Phone
* Dropdown
* Date
* DateTime
* Boolean
* Reference
* Reference preview
* Required fields
* Read-only fields
* Multiple form sections
* Related links

Create enough mock records to demonstrate pagination:

```text
100 records
```

The list should initially show:

```text
Showing 1 - 10 of 100
```

and support changing pages.

---

# 50. FINAL EXPECTATION

The result should look and behave like the **foundation of a real enterprise service management platform**, not like a simple CRUD demo.

The most important objective is:

```text
API Metadata
      ↓
Generic React Components
      ↓
Form View / List View
      ↓
InfraEase Backend
```

Build the frontend so that when the real InfraEase backend is connected later, I can provide metadata/API responses and the same components automatically render different tables, fields, sections, columns, menus, actions, and reference fields.

Focus heavily on:

1. Excellent Form View UX
2. Excellent List View UX
3. Reusable Reference/Lookup field
4. Inline editing
5. Server-side pagination
6. Server-side sorting
7. API-driven menus
8. Multi-level menus
9. Pin/unpin sidebar behavior
10. Clean enterprise-grade UI
11. Reusable architecture
12. Responsive design
13. Clean API abstraction
14. No table-specific hard-coding

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7481954a-ff5a-44d5-b69f-ca8fb4bbdeeb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
