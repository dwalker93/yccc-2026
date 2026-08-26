import { verifyMemberEducationAction } from "@/actions/members-actions"
import { MemberEducation } from "@/services/member-education-service"
import { formatPeriod } from "@/utils/utils"
import { useQueryClient } from "@tanstack/react-query"

import {
  FIELDS_OF_STUDY,
  QUALIFICATION_LEVELS,
} from "@workspace/shared/constants/educations"
import { Button } from "@workspace/ui/components/button"

import { useUpdateMemberEducationMutation } from "@/hooks/members/update-member-education-mutaion"
import { ActionDialog } from "@/components/action-dialog"
import { PendingBadge } from "@/components/badge"
import { CreateEducationDialog } from "@/components/create-education-dialog"
import { createColumns } from "@/components/simple-table/simple-table"

export const getEducationColumns = (memberId: string) => {
  const {
    mutateAsync: updateMemberEducation,
    isPending: isUpdatingMemberEducation,
  } = useUpdateMemberEducationMutation({ memberId })

  return createColumns<MemberEducation>([
    { key: "institution", label: "Institution" },
    {
      key: "qualification",
      label: "Qualification",
      render: (row) =>
        QUALIFICATION_LEVELS.find((q) => q.value === row.qualification)?.label,
    },
    {
      key: "fieldOfStudy",
      label: "Field",
      render: (row) =>
        FIELDS_OF_STUDY.find((field) => field.value === row.fieldOfStudy)
          ?.label || "-",
    },
    {
      key: "period",
      label: "Period / School Year",
      render: (row) =>
        row.qualification === "secondary"
          ? row.endYear
          : formatPeriod(
              row.startMonth!,
              row.startYear!,
              row.endMonth,
              row.endYear
            ),
    },
    {
      key: "isVerified",
      label: "Verified",
      render: (row) =>
        row.isVerified ? (
          <span className="text-xs text-green-500">✓ Yes</span>
        ) : (
          <PendingBadge />
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        return (
          <div className="flex gap-2">
            {!row.isVerified && (
              <ActionDialog
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-700 text-emerald-700
                      dark:border-green-700 dark:text-green-400"
                  >
                    Verify
                  </Button>
                }
                actionFn={() => verifyMemberEducationAction(row.id, memberId)}
                title="Verify Education"
                description="Are you sure you want to verify this education record?"
                cancelText="Cancel"
                actionText="Verify"
                successMessage="Education verified successfully"
              />
            )}
            <CreateEducationDialog
              dialogTriggerButton={
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              }
              initialValues={row as MemberEducation}
              onSubmit={async (data) => {
                const payload =
                  data.qualification === "secondary"
                    ? {
                        qualification: data.qualification,
                        institution: data.schoolName,
                        endYear: data.schoolYear,
                      }
                    : data
                await updateMemberEducation({
                  educationId: row.id,
                  educationData: payload,
                })
              }}
              isSaving={isUpdatingMemberEducation}
            />
          </div>
        )
      },
    },
  ])
}
