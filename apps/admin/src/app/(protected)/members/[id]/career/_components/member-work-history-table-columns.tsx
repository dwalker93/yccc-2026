import { MemberProfession } from "@/services/member-profession-service"
import { formatPeriod } from "@/utils/utils"

import { EMPLOYMENT_TYPES } from "@workspace/shared/constants/educations"
import { Button } from "@workspace/ui/components/button"

import { NoBadge, PendingBadge, YesBadge } from "@/components/badge"
import { createColumns } from "@/components/simple-table/simple-table"

export const workHistoryColumns = createColumns<MemberProfession>([
  { key: "jobTitle", label: "Job Title" },
  { key: "employer", label: "Employer" },
  { key: "location", label: "Location" },
  {
    key: "employmentType",
    label: "Employment Type",
    render: (row) =>
      EMPLOYMENT_TYPES.find((type) => type.value === row.employmentType)?.label,
  },
  {
    key: "period",
    label: "Period",
    render: (row) =>
      formatPeriod(row.startMonth, row.startYear, row.endMonth, row.endYear),
  },
  {
    key: "isCurrent",
    label: "Current",
    render: (row) => (row.isCurrent ? <YesBadge /> : <NoBadge />),
  },
  {
    key: "isVerified",
    label: "Verified",
    render: (row) => (row.isVerified ? <YesBadge /> : <PendingBadge />),
  },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <div className="flex gap-2">
        {!row.isVerified && (
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-700 text-emerald-700 dark:border-green-700
              dark:text-green-400"
          >
            Verify
          </Button>
        )}
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>
    ),
  },
])
