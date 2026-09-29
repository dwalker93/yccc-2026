import { verifyMemberProfessionAction } from "@/actions/members-actions"
import { MemberProfession } from "@/services/member-profession-service"
import { formatPeriod } from "@/utils/utils"
import { Trash2 } from "lucide-react"

import { EMPLOYMENT_TYPES } from "@workspace/shared/constants/educations"
import { Button } from "@workspace/ui/components/button"

import { type UpdateMemberProfessionPayload } from "@/hooks/members/update-member-profession-mutation"
import { ActionDialog } from "@/components/action-dialog"
import { NoBadge, PendingBadge, YesBadge } from "@/components/badge"
import { CreateExperienceDialog } from "@/components/create-experience-dialog"
import { createColumns } from "@/components/simple-table/simple-table"

export const getWorkHistoryColumns = ({
  memberId,
  updateMemberProfession,
  isUpdatingMemberProfession,
  deleteMemberProfession,
}: {
  memberId: string
  updateMemberProfession: (
    payload: UpdateMemberProfessionPayload
  ) => Promise<unknown>
  isUpdatingMemberProfession: boolean
  deleteMemberProfession: (payload: {
    professionId: string
  }) => Promise<
    | { error: string; success?: undefined }
    | { success: boolean; error?: undefined }
  >
}) =>
  createColumns<MemberProfession>([
    { key: "jobTitle", label: "Job Title" },
    { key: "employer", label: "Employer" },
    { key: "location", label: "Location" },
    {
      key: "employmentType",
      label: "Employment Type",
      render: (row) =>
        EMPLOYMENT_TYPES.find((type) => type.value === row.employmentType)
          ?.label,
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
              actionFn={() => verifyMemberProfessionAction(row.id, memberId)}
              title="Verify Profession"
              description="Are you sure you want to verify this profession record?"
              cancelText="Cancel"
              actionText="Verify"
              successMessage="Profession verified successfully"
            />
          )}
          <CreateExperienceDialog
            dialogTriggerButton={
              <Button variant="outline" size="sm">
                Edit
              </Button>
            }
            initialValues={row}
            onSave={async (data) => {
              await updateMemberProfession({
                professionId: row.id,
                professionData: data,
              })
            }}
            isSaving={isUpdatingMemberProfession}
          />
          <ActionDialog
            trigger={
              <Button variant="destructive" size="icon">
                <Trash2 />
              </Button>
            }
            actionFn={() => deleteMemberProfession({ professionId: row.id })}
            title="Delete Profession"
            description="Are you sure you want to delete this profession record?"
            cancelText="Cancel"
            actionText="Delete"
            actionButtonVariant="destructive"
            successMessage="Profession deleted successfully"
          />
        </div>
      ),
    },
  ])
