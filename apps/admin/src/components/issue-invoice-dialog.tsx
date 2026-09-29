import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toMemberId } from "@/utils/member"
import { formatCurrency, formatDate } from "@/utils/utils"
import { useSelector } from "@tanstack/react-form"
import dayjs from "dayjs"

import { capitalizeFirstLetter } from "@workspace/shared/utils/strings"
import {
  issueInvoiceFormSchema,
  IssueInvoiceFormValues,
} from "@workspace/shared/zod-schemas/invoice-schema"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldTitle,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group"
import { Spinner } from "@workspace/ui/components/spinner"
import { useAppForm } from "@workspace/ui/hooks/form"

import { useIssueInvoiceMutation } from "@/hooks/invoices/issue-invoice-mutation"
import { useMemberLatestInvoice } from "@/hooks/members/use-member-latest-invoice"

const toDateInputValue = (date?: string | Date | null): string => {
  if (!date) return ""
  const d = new Date(date)
  return isNaN(d.getTime()) ? "" : (d.toISOString().split("T")[0] ?? "")
}

const defaultFormValues: IssueInvoiceFormValues = {
  planId: "PLN0002",
  periodStart: toDateInputValue(new Date()),
  periodEnd: toDateInputValue(new Date()),
  dueDate: toDateInputValue(dayjs().add(30, "days").toDate()),
  discount: 0,
}

export function IssueInvoiceDialog() {
  const [open, setOpen] = useState(false)

  const rawMemberId = useParams().id as string
  const memberId = toMemberId(rawMemberId)

  const { data: latestInvoice, isPending: isLatestInvoicePending } =
    useMemberLatestInvoice(memberId)

  const hasCurrentPaidInvoice = Boolean(latestInvoice?.invoiceNumber)
  const isLatestInvoiceScheduled = Boolean(
    latestInvoice?.subscriptionStatus === "scheduled"
  )

  const { mutateAsync: issueInvoice, isPending: isIssueInvoicePending } =
    useIssueInvoiceMutation({ memberId })

  const router = useRouter()

  const form = useAppForm({
    defaultValues: {
      ...defaultFormValues,
      periodStart:
        toDateInputValue(latestInvoice?.periodEnd) ||
        toDateInputValue(new Date()),
    },
    validators: {
      onSubmit: issueInvoiceFormSchema,
    },
    onSubmit: async ({ value }) => {
      const data = issueInvoiceFormSchema.parse(value)

      try {
        await issueInvoice(data)
        form.reset()
        setOpen(false)
        router.refresh()
      } catch {}
    },
  })

  const [discount, setDiscount] = useState<number>(0)
  const submittedDiscount = useSelector(
    form.store,
    (state) => state.values.discount
  )

  const periodStart = useSelector(
    form.store,
    (state) => state.values.periodStart
  )

  useEffect(() => {
    if (periodStart) {
      const newPeriodEnd = dayjs(periodStart)
        .add(1, "year")
        .add(1, "day")
        .toDate()
      form.setFieldValue("periodEnd", toDateInputValue(newPeriodEnd))
    }
  }, [periodStart])

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value === false) {
          form.reset()
        }
        setOpen(value)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Issue Invoice
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          {isLatestInvoicePending ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Issue New Invoice</DialogTitle>
                <DialogDescription>
                  {hasCurrentPaidInvoice &&
                    !isLatestInvoiceScheduled &&
                    latestInvoice?.status === "paid" &&
                    "Current period is already paid. Issue invoice for future period"}

                  {hasCurrentPaidInvoice &&
                    !isLatestInvoiceScheduled &&
                    latestInvoice?.status === "open" &&
                    "Current period is already open. Settle the invoice to issue a new one"}

                  {!hasCurrentPaidInvoice &&
                    !isLatestInvoiceScheduled &&
                    "Issue invoice for current period"}

                  {isLatestInvoiceScheduled && "Invoice already scheduled"}
                </DialogDescription>
              </DialogHeader>

              <div
                className="-mx-4 my-2 max-h-[50vh] overflow-y-auto px-4
                  md:max-h-[70vh]"
              >
                {hasCurrentPaidInvoice && (
                  <div
                    className="my-4 rounded-lg border border-emerald-700/40
                      bg-emerald-500/10 p-3"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span
                        className="text-xs font-semibold tracking-wide
                          text-emerald-400 uppercase"
                      >
                        {isLatestInvoiceScheduled ? "Next" : "Current"} period
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-neutral-300">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Invoice</span>
                        <span>#{latestInvoice?.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Plan</span>
                        <span>
                          {capitalizeFirstLetter(
                            latestInvoice?.subscriptionPlan!
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Period</span>
                        <span>
                          {formatDate(latestInvoice?.periodStart)} –{" "}
                          {formatDate(latestInvoice?.periodEnd)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Amount</span>
                        <span>{formatCurrency(latestInvoice?.amount!)}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-neutral-400">
                      {isLatestInvoiceScheduled &&
                      latestInvoice?.status === "open"
                        ? "This user already has a pending invoice for the next period."
                        : isLatestInvoiceScheduled &&
                            latestInvoice?.status === "paid"
                          ? "This user already has a paid invoice for the next period."
                          : latestInvoice?.status === "open"
                            ? "This user already has a pending invoice for the current period."
                            : "This user already has a paid invoice for the current period. The new invoice will be issued for a future period."}
                    </p>
                  </div>
                )}

                {!isLatestInvoiceScheduled &&
                  latestInvoice?.status !== "open" && (
                    <>
                      <div className="flex flex-col gap-2 py-2">
                        <FieldLabel>Subscription Plan</FieldLabel>
                        <form.AppField name="planId">
                          {(field) => (
                            <RadioGroup
                              value={field.state.value}
                              onValueChange={(v) =>
                                field.handleChange(v as "PLN0002")
                              }
                              className="w-full"
                              disabled={isIssueInvoicePending}
                            >
                              <FieldLabel htmlFor="pro">
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle>
                                      Pro{" "}
                                      <span className="text-muted-foreground">
                                        LKR 2,500 / yr
                                      </span>
                                    </FieldTitle>
                                  </FieldContent>
                                  <RadioGroupItem value="PLN0002" id="pro" />
                                </Field>
                              </FieldLabel>
                            </RadioGroup>
                          )}
                        </form.AppField>
                      </div>

                      <div className="flex flex-col gap-2 py-2">
                        <FieldLabel>Period</FieldLabel>
                        <div className="flex items-start gap-2">
                          <form.AppField name="periodStart">
                            {(field) => <field.input type="date" disabled />}
                          </form.AppField>
                          <div
                            className="flex items-center pt-1 text-sm
                              text-neutral-400"
                          >
                            to
                          </div>
                          <form.AppField name="periodEnd">
                            {(field) => <field.input type="date" disabled />}
                          </form.AppField>
                        </div>
                      </div>

                      <form.AppField name="dueDate">
                        {(field) => (
                          <field.input
                            label="Due Date"
                            type="date"
                            requiredIcon={false}
                            disabled={isIssueInvoicePending}
                          />
                        )}
                      </form.AppField>

                      <div className="mt-4 mb-6 flex flex-col gap-2">
                        <FieldLabel>Discount</FieldLabel>
                        <div className="flex items-start gap-2">
                          <Input
                            type="number"
                            min={0}
                            placeholder="0.00"
                            disabled={isIssueInvoicePending}
                            value={discount}
                            onChange={(e) => {
                              setDiscount(Number(e.target.value))
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              form.setFieldValue("discount", discount * 100)
                            }}
                            disabled={isIssueInvoicePending}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <FieldLegend>Invoice Summary</FieldLegend>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Amount</span>
                            <span className="text-neutral-100">
                              {formatCurrency(250000)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Discount</span>
                            <span className="text-neutral-100">
                              {submittedDiscount > 0
                                ? `- ${formatCurrency(submittedDiscount)}`
                                : formatCurrency(0)}
                            </span>
                          </div>
                          <div
                            className="flex justify-between border-t
                              border-neutral-700 pt-2"
                          >
                            <span className="font-semibold text-neutral-200">
                              Total
                            </span>
                            <span className="text-base font-bold text-amber-400">
                              {formatCurrency(250000 - submittedDiscount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isIssueInvoicePending}
                  >
                    {isLatestInvoiceScheduled ||
                    (hasCurrentPaidInvoice &&
                      !isLatestInvoiceScheduled &&
                      latestInvoice?.status === "open")
                      ? "Close"
                      : "Cancel"}
                  </Button>
                </DialogClose>

                {!isLatestInvoiceScheduled &&
                  !(
                    hasCurrentPaidInvoice &&
                    !isLatestInvoiceScheduled &&
                    latestInvoice?.status === "open"
                  ) && (
                    <Button type="submit" disabled={isIssueInvoicePending}>
                      Issue Invoice
                    </Button>
                  )}
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
