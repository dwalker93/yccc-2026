# `@workspace/shared`

Reusable schemas, utilities, and constants shared across workspace apps.

## Exports

- `@workspace/shared/schemas/*` — Zod input/validation schemas
- `@workspace/shared/utils/*` — helpers (e.g. `calculateAge`, `ageFromDob`)
- `@workspace/shared/constants/*` — shared constants (e.g. `DistrictsWithProvinces`)

## Example

```ts
import { DistrictsWithProvinces } from "@workspace/shared/constants/DistrictsWithProvinces"
import { ageFromDob } from "@workspace/shared/utils/age-calculator"
```
