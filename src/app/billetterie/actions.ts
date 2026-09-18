"use server";

import { redirect } from "next/navigation";
import { parseCheckoutForm, saveOrder } from "@/lib/order";
import type { CheckoutState } from "@/lib/tickets";
import { getBirthDateBounds, getBookingRange } from "@/lib/visit-dates";

export async function checkout(_previousState: CheckoutState, formData: FormData): Promise<CheckoutState> {
  // Recomputed rather than taken from the page, which may have stayed open past midnight
  const now = new Date();
  const result = parseCheckoutForm(formData, getBookingRange(now), getBirthDateBounds(now));
  if (result.errors) return { errors: result.errors };

  await saveOrder(result.order);
  redirect("/billetterie/confirmation");
}
