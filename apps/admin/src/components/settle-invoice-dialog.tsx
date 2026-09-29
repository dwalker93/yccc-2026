import { useState } from "react"
import { useRouter } from "next/navigation"
import { MemberInvoice } from "@/services/member-invoice-service"
import { formatCurrency, formatDate } from "@/utils/utils"
import { useSelector } from "@tanstack/react-form"

import {
  invoiceSettlementSchema,
  type InvoiceSettlementFormValues,
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
import { useAppForm } from "@workspace/ui/hooks/form"

import { useSettleInvoiceMutation } from "@/hooks/invoices/settle-invoice-mutation"

export const defaultFormValues: InvoiceSettlementFormValues = {
  method: "cash",
  discount: 0,
  referenceNumber: "",
}

export function SettleInvoiceDialog({
  invoice,
  memberId,
}: {
  invoice: MemberInvoice
  memberId: string
}) {
  const [open, setOpen] = useState(false)

  const { mutateAsync: settleInvoice, isPending } = useSettleInvoiceMutation({
    memberId,
  })
  const router = useRouter()

  const form = useAppForm({
    defaultValues: {
      ...defaultFormValues,
      discount: invoice.discount,
    },
    validators: {
      onSubmit: invoiceSettlementSchema,
    },
    onSubmit: async ({ value }) => {
      const data = invoiceSettlementSchema.parse(value)

      try {
        await settleInvoice({
          invoiceId: invoice.id,
          discount: data.discount,
          method: data.method,
          referenceNumber:
            data.method === "bank_transfer" ? data.referenceNumber : undefined,
        })
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

  const isBankTransfer = useSelector(
    form.store,
    (state) => state.values.method === "bank_transfer"
  )

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
        <Button size="sm">Settle</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>Settle Invoice #{invoice.invoiceNumber}</DialogTitle>
            <DialogDescription>
              From {formatDate(invoice.periodStart)} to{" "}
              {formatDate(invoice.periodEnd)}
            </DialogDescription>
          </DialogHeader>

          <div
            className="-mx-4 max-h-[50vh] overflow-y-auto px-4 md:max-h-[70vh]"
          >
            <div className="mt-4 mb-6 flex flex-col gap-2">
              <FieldLabel>Discount</FieldLabel>
              <div className="flex items-start gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  disabled={invoice.discount !== 0 || isPending}
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
                  disabled={invoice.discount !== 0 || isPending}
                >
                  Apply
                </Button>
              </div>
            </div>

            {/* Invoice summary */}
            <div className="mb-4">
              <FieldLegend>Invoice Summary</FieldLegend>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Amount</span>
                  <span className="text-neutral-100">
                    {formatCurrency(invoice.amount)}
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
                  className="flex justify-between border-t border-neutral-700
                    pt-2"
                >
                  <span className="font-semibold text-neutral-200">Total</span>
                  <span className="text-base font-bold text-amber-400">
                    {formatCurrency(invoice.amount - submittedDiscount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 py-4">
              <FieldLabel>Payment method</FieldLabel>
              <form.AppField name="method">
                {(field) => (
                  <RadioGroup
                    value={field.state.value}
                    onValueChange={(v) =>
                      field.handleChange(v as "cash" | "bank_transfer")
                    }
                    className="max-w-sm"
                    disabled={isPending}
                  >
                    <FieldLabel htmlFor="cash">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Cash</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem value="cash" id="cash" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="bank_transfer">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Bank Transfer</FieldTitle>
                        </FieldContent>
                        <RadioGroupItem
                          value="bank_transfer"
                          id="bank_transfer"
                        />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                )}
              </form.AppField>
            </div>

            {isBankTransfer && (
              <div className="mt-2 mb-4">
                <form.AppField name="referenceNumber">
                  {(field) => (
                    <field.input
                      type="text"
                      label="Reference number"
                      optionalField
                      placeholder="Reference number"
                      disabled={isPending}
                    />
                  )}
                </form.AppField>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              Settle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
