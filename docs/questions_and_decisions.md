# About Time - Questions and Decisions Log

This document tracks all questions, decisions, assumptions, and clarifications throughout the project lifecycle. This is a living document that should be updated whenever new questions arise or decisions are made.

## How to Use This Log

1. **Adding Questions**:
   - Add questions as they arise
   - Assign each question a unique ID (QXXX)
   - Tag with relevant component/feature
   - Include date asked

2. **Recording Decisions**:
   - Document all decisions with rationale
   - Reference the question ID if applicable
   - Include date and decision makers
   - Link to any relevant documentation

3. **Weekly Review**:
   - Review open questions weekly
   - Update status on existing questions
   - Prioritize questions blocking development

## Open Questions

| ID    | Date       | Component/Feature | Question                                                | Status      | Priority | Assigned To |
|-------|------------|------------------|--------------------------------------------------------|-------------|----------|-------------|
| Q001  | 2025-10-20 | Authentication   | How should we handle password reset without email config? | Open        | High     | -           |
| Q002  | 2025-10-20 | OT Calculation   | Should OT calculation handle partial hours (e.g., 8.5)?   | Open        | Medium   | -           |
| Q003  | 2025-10-20 | Database         | What's the appropriate CASCADE behavior for TimeclockEntry? | Open        | Medium   | -           |
| Q004  | 2025-10-20 | Environment      | Is UV already configured in the Docker environment?       | Open        | High     | -           |
| Q005  | 2025-10-20 | Testing          | What's the minimum test coverage target for the project?  | Open        | Medium   | -           |

## Decisions

| ID    | Date       | Component/Feature | Decision                                              | Rationale                                           | Made By    | Related Question |
|-------|------------|------------------|-------------------------------------------------------|-----------------------------------------------------|------------|------------------|
| D001  | 2025-10-20 | Package Management | Use UV for all Python package management              | Better performance, lock file support, deterministic builds | Team       | -                |
| D002  | 2025-10-20 | Development      | Implement weekly demo schedule (Fridays)              | Regular demos ensure continuous progress and feedback | Team       | -                |
| D003  | 2025-10-20 | Development      | Follow feature-by-feature approach with vertical slices | Complete features provide value sooner and allow better testing | Team | -    |
| D004  | 2025-10-20 | Documentation    | Update documentation with each feature implementation  | Ensures documentation stays current and complete     | Team       | -                |
| D005  | 2025-10-20 | Architecture     | Extend Django User model with OneToOne relationship    | Best practice for adding custom fields while preserving Django's auth | Team | -   |

## Assumptions Requiring Validation

| ID    | Date       | Component/Feature | Assumption                                           | Validation Method                                  | Status     | Priority |
|-------|------------|------------------|-----------------------------------------------------|---------------------------------------------------|------------|----------|
| A001  | 2025-10-20 | OT Calculation   | OT calculations apply to new entries only, not retroactively | Confirm in PRD (line 146)                         | Validated  | High     |
| A002  | 2025-10-20 | Time Entries     | Entries cannot span midnight per business rule       | Confirm in PRD (line 189)                         | Validated  | High     |
| A003  | 2025-10-20 | Authentication   | 4-hour session timeout is sufficient for all users   | Confirm with stakeholders                         | Pending    | Medium   |
| A004  | 2025-10-20 | TOIL Balance     | TOIL balances do not expire automatically            | Confirm in PRD (line 156)                         | Validated  | Medium   |
| A005  | 2025-10-20 | Deployment       | Single PostgreSQL instance will handle 3-5 concurrent users | Confirm with performance testing               | Pending    | Low      |

## Clarifications Received

| ID    | Date       | Component/Feature | Original Question                                   | Clarification                                      | Source     |
|-------|------------|------------------|-----------------------------------------------------|---------------------------------------------------|------------|
| C001  | 2025-10-20 | Future Features   | Will email notifications be added later?             | Yes, email notifications planned for Phase 2 (PRD line 864) | PRD        |
| C002  | 2025-10-20 | Holiday Accrual   | What is the standard holiday accrual?                | 160 hours per year (20 days at 8 hours/day) per PRD line 163 | PRD        |
| C003  | 2025-10-20 | Request Modification | Can requests be edited after submission?           | No, requests cannot be edited - must cancel and resubmit (PRD line 716) | PRD        |
| C004  | 2025-10-20 | Manager Permissions | Do all managers have the same level of access?      | Yes for MVP - all managers have equal permissions (PRD line 130) | PRD        |
| C005  | 2025-10-20 | OT Tiers          | Does the system support multiple OT rate tiers?      | No, only one OT multiplier applies system-wide (PRD line 144) | PRD        |

## Weekly Question Review

### Week 1 (2025-10-20 to 2025-10-24)

**Priority Questions to Address:**
- Q001: How should we handle password reset without email config?
- Q004: Is UV already configured in the Docker environment?

**Decisions Made:**
- D001-D005 established as foundation for development approach

**Questions Resolved:**
- None yet

**New Questions:**
- Q001-Q005 identified during project initialization
