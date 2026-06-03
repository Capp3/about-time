# Broadcast Timekeeper — WASP Template

A time-keeping system built for broadcast operations, using Wasp + React + PostgreSQL.

## Features
- Multi-user with username/password auth (admin & crew roles)
- Clock in / Clock out with job code tagging
- Personal timesheet with date + job code filtering
- Admin panel: view all users' punches, inline edit, filter
- CSV and Excel (.xlsx) export for payroll reporting
- Dark broadcast-UI theme

## Quick Start

```bash
# 1. Install Wasp CLI
curl -sSL https://get.wasp-lang.dev/installer.sh | sh

# 2. Create a new project FROM THIS TEMPLATE
#    (place these files in a new wasp project directory)
wasp new BroadcastTimekeeper -t minimal
# Then replace the generated files with the files in this template.

# 3. Install SheetJS for Excel export
cd BroadcastTimekeeper
npm install xlsx --prefix src

# 4. Configure your database in .env.server
# DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# 5. Run DB migrations and start
wasp db migrate-dev
wasp start
```

## Roles
- **crew** — can clock in/out, view and delete their own punches, export their own timesheet
- **admin** — all crew permissions + view/edit all users, full reporting & exports

> To promote a user to admin, run:
> `wasp db studio` → edit the User record → set `role` to `"admin"`

## Project Structure
```
main.wasp          ← Wasp config: routes, auth, queries, actions
schema.prisma      ← PostgreSQL data model (User, PunchRecord)
src/
  auth/signup.ts   ← Extra signup fields (fullName, department)
  queries/         ← Read operations (getMyPunches, getAllPunchesAdmin, getReportData)
  actions/         ← Write operations (clockIn, clockOut, edit, delete)
  pages/           ← React pages (Auth, Dashboard, Timesheet, Admin)
  components/      ← NavBar
  utils/export.ts  ← CSV + Excel export helpers
  Main.css         ← Dark broadcast UI theme
```

## CSV / Excel Columns
| Full Name | Department | Date | Clock In | Clock Out | Duration (h) | Job Code | Note |
