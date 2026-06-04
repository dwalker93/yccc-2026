# `@workspace/shared`

Reusable schemas, utilities, and constants shared across workspace apps.

## Exports

- `@workspace/shared/schemas/*` — Zod input/validation schemas
- `@workspace/shared/utils/*` — helpers (e.g. `calculateAge`, `ageFromDob`)
- `@workspace/shared/constants/*` — shared constants (e.g. `DISTRICTS`)

## Example

```ts
import { DISTRICTS } from "@workspace/shared/constants/districts"
import { ageFromDob } from "@workspace/shared/utils/age-calculator"
```
