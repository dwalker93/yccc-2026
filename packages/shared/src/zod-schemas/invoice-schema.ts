import { z } from "zod"

const cashSettlementSchema = z.object({
  method: z.literal("cash"),
})

const bankSettlementSchema = z.object({
  method: z.literal("bank_transfer"),
  referenceNumber: z.string().optional(),
})

export const invoiceSettlementFormSchema = z.object({
  discount: z.number().min(0),
  method: z.literal("cash").or(z.literal("bank_transfer")),
  referenceNumber: z.string().optional(),
})

export const invoiceSettlementSchema = z
  .discriminatedUnion("method", [cashSettlementSchema, bankSettlementSchema], {
    message: "Payment method is required.",
  })
  .and(
    z.object({
      discount: z.number().min(0),
    })
  )

export type InvoiceSettlement = z.infer<typeof invoiceSettlementSchema>
export type InvoiceSettlementFormValues = z.infer<
  typeof invoiceSettlementFormSchema
>

export const issueInvoiceFormSchema = z.object({
  planId: z.literal("PLN0002"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  dueDate: z.string().min(1, "Due date is required"),
  discount: z.number().min(0),
})

export type IssueInvoiceFormValues = z.infer<typeof issueInvoiceFormSchema>
