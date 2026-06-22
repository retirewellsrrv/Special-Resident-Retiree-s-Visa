import Xendit from "xendit-node";

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

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
