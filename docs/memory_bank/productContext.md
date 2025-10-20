# About Time - Product Context

## Product Overview

About Time is a professional timekeeping and time-off management system for a broadcast facility. The application handles time tracking and time-off request management for a single business unit with 20-30 employees and 3-5 concurrent users.

## Core Features (MVP)

1. **User Authentication**
   - Employee/Manager role-based system
   - Django session-based authentication with CSRF protection
   - 4-hour session timeout
   - Password complexity requirements (minimum 8 characters with letters and numbers)

2. **Timekeeping**
   - Timeclock entry submission and editing
   - Break time tracking
   - Overtime calculation based on configurable settings
   - Approval workflow for managers

3. **Time-Off Management**
   - Holiday, leave, and TOIL (Time Off In Lieu) request submission
   - Balance tracking and adjustments
   - Request approval workflow
   - Cancellation handling with balance restoration

4. **Management Features**
   - Employee management (list, detail, balance adjustments)
   - User role assignments
   - Settings configuration
   - Reporting capabilities (timecard, balance)
   - CSV export for payroll integration

5. **Notifications**
   - In-app notifications for managers
   - Approval reminders
   - End-of-month notifications for unapproved entries

## Business Rules

1. **Overtime Calculation**
   - Configurable calculation method (per day or per week)
   - Configurable threshold hours
   - Configurable multiplier (1x, 1.5x, 2x)
   - Configurable payout method (paycheck or TOIL)

2. **Time-Off Management**
   - Holiday: Deducted from balance, requires approval
   - Leave: Does not deduct from balance, requires approval
   - TOIL: Deducted from balance, requires approval (if activated)
   - Manual balance adjustments by managers

3. **Timeclock Rules**
   - Entries editable by employees until approved
   - After approval, only managers can edit
   - Entries cannot span midnight (single-day only)
   - Break time represents total daily breaks as single value

## User Roles

1. **Employee**
   - Submit timeclock entries
   - Submit and cancel time-off requests
   - View personal dashboard and balances
   - Edit own timeclock entries (until approved)

2. **Manager**
   - All employee permissions
   - Approve/reject timeclock entries and requests
   - Edit any timeclock entry (including approved)
   - Adjust employee time balances
   - Change user roles
   - Access reports and settings

## Success Criteria

- 100% of timeclock entries submitted through system (no paper/spreadsheets)
- Approvals completed within 7 days
- Accurate overtime and balance calculations
- Page loads under 2 seconds
- Support for 3-5 concurrent users without performance degradation
