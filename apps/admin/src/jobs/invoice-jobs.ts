import dayjs from "dayjs"
import { and, eq, lt } from "drizzle-orm"

import { invoices } from "@workspace/shared/schemas/invoices-schema"
import { payments } from "@workspace/shared/schemas/payments-schema"

import { appdb } from "@/lib/db"

import { rejectMemberService } from "../services/members-service"

// weekly cron — void overdue invoices older than 30 days
export async function voidAbandonedInvoicesJob() {
  const thirtyDaysAgo = dayjs().subtract(30, "days").toDate()

  const abandoned = await appdb
    .select({ id: invoices.id, memberId: invoices.memberId })
    .from(invoices)
    .where(and(eq(invoices.status, "open"), lt(invoices.dueAt, thirtyDaysAgo)))

  for (const invoice of abandoned) {
    await appdb.transaction(async (tx) => {
      // void the invoice
      await tx
        .update(invoices)
        .set({ status: "void", voidedAt: new Date() })
        .where(eq(invoices.id, invoice.id))

      // mark payment as failed
      await tx
        .update(payments)
        .set({
          status: "failed",
          failureReason: "Payment not received within 30 days",
        })
        .where(
          and(
            eq(payments.invoiceId, invoice.id),
            eq(payments.status, "pending")
          )
        )

      // optionally reject the member automatically
      await rejectMemberService({
        memberId: invoice.memberId,
        reason: "Payment not received within 30 days — application voided",
        actionedBy: "system",
      })
    })
  }
}
