# Types

All TypeScript type definitions and interfaces live here so developers can
find them in one place instead of hunting through hooks and components.

## Organization

```
types/
├── index.ts            # Main exports (barrel)
├── auth.ts             # User, UserRole, LoginSession
├── citizen.ts          # Citizen, RegistrationFormData, EmploymentData, family/education/... records
├── registration.ts     # Citizen registration wizard step types (PersonalInfoData, NidData, FamilyMemberDraft)
├── employment.ts       # Employment form types (EmploymentFormData, PanStatus, proof upload, draft)
├── household.ts        # Household form types (HouseholdFormData, draft)
├── document.ts         # Generic document upload state (PanelState, DocumentUpload)
├── common.ts           # Shared types (SaveStatus)
├── map.ts              # Map selection + Leaflet map props (MapLevel, MapSelection, MapMarker, MapProps)
├── navigation.ts       # Sidebar/nav model (WardViewId, WardNavSection, AdminNavSection, ...)
├── ward.ts             # Ward dashboard domain types (ApprovalItem, IdCardRequest, notifications, ...)
├── ward-admin.ts       # Ward admin account/session types
├── dashboard.ts        # StatItem, StatTone, RecentActivityItem, AlertItem
├── analytics.ts        # AnalyticsSummary
├── eligibility-rule.ts # EligibilityRule, ConditionExpression
├── audit-log.ts        # AuditLog
├── province-admin.ts   # ProvinceAdmin
└── user.ts             # (legacy) simple User shape
```

## Guidelines

- Use interfaces for object shapes
- Use type aliases for unions / derived types
- Export everything from `index.ts` for convenience (`import type { X } from "@/types"`)
- Keep component-local props (e.g. `ButtonProps`) with their component — only shared/domain types go here
- Avoid `any` type
- Document complex types with comments
