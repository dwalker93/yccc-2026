import path from "path"
import { formatCurrency, formatDate } from "@/utils/utils"
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import { capitalizeFirstLetter } from "@workspace/shared/utils/strings"

// Register once per cold start — guard against re-registering on hot reload
if (!Font.getRegisteredFontFamilies?.().includes("Inter")) {
  Font.register({
    family: "Inter",
    fonts: [
      {
        src: path.join(process.cwd(), "public/fonts/Inter-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(process.cwd(), "public/fonts/Inter-Medium.ttf"),
        fontWeight: 500,
      },
      {
        src: path.join(process.cwd(), "public/fonts/Inter-Bold.ttf"),
        fontWeight: 700,
      },
    ],
  })
  Font.register({
    family: "Playfair Display",
    fonts: [
      {
        src: path.join(process.cwd(), "public/fonts/PlayfairDisplay-Bold.ttf"),
        fontWeight: 700,
      },
      {
        src: path.join(
          process.cwd(),
          "public/fonts/PlayfairDisplay-BoldItalic.ttf"
        ),
        fontWeight: 700,
        fontStyle: "italic",
      },
    ],
  })
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Inter", color: "#0f172a" },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logo: { width: 32, height: 32 },
  brandName: { fontFamily: "Playfair Display", fontSize: 15, fontWeight: 700 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  invoiceTitle: {
    fontFamily: "Playfair Display",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  muted: { color: "#64748b" },
  badge: {
    fontSize: 9,
    color: "#16a34a",
    backgroundColor: "#f0fdf4",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 10, fontWeight: 700, marginBottom: 6 },
  line: { flexDirection: "row", marginBottom: 3 },
  label: { color: "#64748b", width: 60 },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableRow: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10 },
  colDesc: { flex: 2 },
  colNum: { flex: 1, textAlign: "right" },
  headerCell: { fontSize: 8, color: "#64748b", textTransform: "uppercase" },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalsLabel: { color: "#64748b" },
  divider: { borderBottomWidth: 1, borderColor: "#e2e8f0", marginVertical: 6 },
  grandTotal: { fontFamily: "Inter", fontSize: 13, fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
  },
  verifyBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  qrImage: { width: 56, height: 56 },
  verifyText: { fontSize: 8, color: "#94a3b8", maxWidth: 220 },
  verifyLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 2,
  },
})

export interface InvoicePdfData {
  invoiceNumber: string
  subscriptionPlan: string
  periodStart: string | Date
  periodEnd: string | Date
  status: string
  issueDate: string | Date
  dueDate?: string | Date | null
  memberName: string
  billingAddress1: string
  billingAddress2?: string | null
  billingCity: string
  subscriptionPlanAmount: number
  amount: number
  discount: number
  paymentCategory?: string | null
  paymentMethod?: string | null
}

export function InvoicePdfDocument({
  data,
  qrDataUrl,
  verificationUrl,
}: {
  data: InvoicePdfData
  qrDataUrl?: string
  verificationUrl?: string
}) {
  const total = data.amount - data.discount
  const logoPath = path.join(process.cwd(), "public/logo.png")

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.brandRow}>
          {/* <Image style={styles.logo} src={logoPath} /> */}
          <Text style={styles.brandName}>
            Che<Text style={{ fontStyle: "italic" }}>fly</Text>
          </Text>
        </View>

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.invoiceTitle}>
              Invoice {data.invoiceNumber}
            </Text>
            <Text style={styles.muted}>
              {capitalizeFirstLetter(data.subscriptionPlan)} plan for{" "}
              {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
            </Text>
          </View>
          <Text style={styles.badge}>{capitalizeFirstLetter(data.status)}</Text>
        </View>

        <View style={styles.section}>
          <View>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.line}>
              <Text style={styles.label}>Date:</Text>
              <Text>{formatDate(data.issueDate)}</Text>
            </View>
            {data.dueDate && (
              <View style={styles.line}>
                <Text style={styles.label}>Due Date:</Text>
                <Text>{formatDate(data.dueDate)}</Text>
              </View>
            )}
            <View style={styles.line}>
              <Text style={styles.label}>Status:</Text>
              <Text>{capitalizeFirstLetter(data.status)}</Text>
            </View>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Billing Address</Text>
            <Text>{data.memberName}</Text>
            <Text>{data.billingAddress1}</Text>
            {data.billingAddress2 && <Text>{data.billingAddress2}</Text>}
            <Text>{data.billingCity},</Text>
            <Text>Sri Lanka</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Line Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.headerCell]}>Description</Text>
            <Text style={[styles.colNum, styles.headerCell]}>Quantity</Text>
            <Text style={[styles.colNum, styles.headerCell]}>Unit Price</Text>
            <Text style={[styles.colNum, styles.headerCell]}>Subtotal</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colDesc}>
              {capitalizeFirstLetter(data.subscriptionPlan)} Plan
            </Text>
            <Text style={styles.colNum}>01</Text>
            <Text style={styles.colNum}>
              {formatCurrency(data.subscriptionPlanAmount)}
            </Text>
            <Text style={styles.colNum}>
              {formatCurrency(data.subscriptionPlanAmount)}
            </Text>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{formatCurrency(data.amount)}</Text>
          </View>
          {!!data.discount && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={{ color: "#16a34a" }}>
                -{formatCurrency(data.discount)}
              </Text>
            </View>
          )}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax (No Tax) 0.0%</Text>
            <Text>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalsRow}>
            <Text style={styles.grandTotal}>Total</Text>
            <Text style={styles.grandTotal}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {data.paymentMethod && (
          <View>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <Text style={styles.muted}>
              {data.paymentCategory} • {data.paymentMethod}
            </Text>
          </View>
        )}

        {qrDataUrl && (
          <View style={styles.verifyBlock}>
            <Image style={styles.qrImage} src={qrDataUrl} />
            <View>
              <Text style={styles.verifyLabel}>Verify this invoice</Text>
              <Text style={styles.verifyText}>{verificationUrl}</Text>
            </View>
          </View>
        )}

        <Text style={styles.footer} fixed>
          Chefly · cheflylk.com · This is a computer-generated invoice.
        </Text>
      </Page>
    </Document>
  )
}
