import Xendit from "xendit-node";

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

const PENDING_INVOICE_LIMIT = 50;

export async function expirePendingInvoices(
  externalIds: string[],
): Promise<{ expired: number; failed: number }> {
  let expired = 0;
  let failed = 0;

  for (const externalId of externalIds) {
    try {
      const invoices = await xenditClient.Invoice.getInvoices({
        externalId,
        limit: PENDING_INVOICE_LIMIT,
      });

      for (const invoice of invoices) {
        if (!invoice.id || invoice.status !== "PENDING") continue;
        try {
          await xenditClient.Invoice.expireInvoice({ invoiceId: invoice.id });
          expired += 1;
        } catch (expireError) {
          console.error(
            "Xendit expireInvoice error:",
            JSON.stringify(expireError, Object.getOwnPropertyNames(expireError)),
          );
          failed += 1;
        }
      }
    } catch (lookupError) {
      console.error(
        "Xendit getInvoices error:",
        JSON.stringify(lookupError, Object.getOwnPropertyNames(lookupError)),
      );
      failed += 1;
    }
  }

  return { expired, failed };
}

type DbPaymentMethod =
  | "pool"
  | "callback_virtual_account"
  | "credit_card"
  | "retail_outlet"
  | "qr_code"
  | "qris"
  | "ewallet"
  | "direct_debit"
  | "bank_transfer"
  | "paylater"
  | "cryptocurrency";

export function mapPaymentMethod(xenditMethod: string | undefined | null): DbPaymentMethod {
  if (!xenditMethod) return "ewallet";
  return xenditMethod.toLowerCase() as DbPaymentMethod;
}

export default xenditClient;
