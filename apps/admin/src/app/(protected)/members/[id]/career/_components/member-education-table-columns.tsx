import { verifyMemberEducationAction } from "@/actions/members-actions"
import { MemberEducation } from "@/services/member-service"
import { formatPeriod } from "@/utils/utils"

import {
  FIELDS_OF_STUDY,
  QUALIFICATION_LEVELS,
} from "@workspace/shared/constants/educations"
import {
  FieldOfStudy,
  HigherEducationLevel,
} from "@workspace/shared/zod-schemas/member-input-schema"
import { Button } from "@workspace/ui/components/button"

import { ActionDialog } from "@/components/action-dialog"
import { PendingBadge } from "@/components/badge"
import {
  CreateEducationDialog,
  defaultFormValues,
} from "@/components/create-education-dialog"
import { createColumns } from "@/components/simple-table/simple-table"

export const getEducationColumns = (memberId: string) =>
  createColumns<MemberEducation>([
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
        let initialValues = { ...defaultFormValues }
        if (row.qualification === "secondary") {
          initialValues.educationLevel = "secondary"
          initialValues.schoolName = row.institution
          initialValues.schoolYear = row.endYear?.toString() ?? ""
        } else {
          initialValues.educationLevel =
            row.qualification as HigherEducationLevel
          initialValues.institutionName = row.institution
          initialValues.fieldOfStudy = row.fieldOfStudy as FieldOfStudy
          initialValues.fromYear = row.startYear?.toString() ?? ""
          initialValues.fromMonth = row.startMonth?.toString() ?? ""
          initialValues.toYear = row.endYear?.toString() ?? ""
          initialValues.toMonth = row.endMonth?.toString() ?? ""
        }

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
              initialValues={initialValues}
              onSave={(data) => {
                console.log(data)
              }}
            />
          </div>
        )
      },
    },
  ])
