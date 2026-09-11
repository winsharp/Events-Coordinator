import { z } from "zod";
import { isFutureExpiry } from "./utils";

const roleSchema = z.enum(["CUSTOMER", "ARTIST", "VENUE"]);
const strongPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/\d/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a symbol");

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Enter your password"),
  role: roleSchema,
});

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Enter your first name"),
    lastName: z.string().trim().min(2, "Enter your last name"),
    email: z.email("Enter a valid email address"),
    password: strongPassword,
    confirmPassword: z.string(),
    role: roleSchema,
    terms: z.literal(true, { error: "Accept the terms to continue" }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const cardSchema = z.object({
  cardholder: z.string().trim().min(2, "Enter the name on card"),
  cardNumber: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().length(16, "Enter a valid 16-digit demonstration card")),
  expiry: z
    .string()
    .refine((value) => isFutureExpiry(value), "Enter a future date as MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "Enter a valid security code"),
  billingEmail: z.email("Enter a valid billing email"),
  terms: z.literal(true, { error: "Accept the purchase terms" }),
});

export const paypalSchema = z.object({
  paypalEmail: z.email("Enter the demonstration PayPal email"),
  billingEmail: z.email("Enter a valid billing email"),
  terms: z.literal(true, { error: "Accept the purchase terms" }),
});

export const usdcSchema = z.object({
  billingEmail: z.email("Enter a valid billing email"),
  terms: z.literal(true, { error: "Accept the purchase terms" }),
});

export const slotSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
    start: z.string().min(4, "Choose a start time"),
    end: z.string().min(4, "Choose an end time"),
  })
  .refine((values) => values.start !== values.end, {
    message: "Start and end times must differ",
    path: ["end"],
  });

export const searchSchema = z.object({
  query: z.string().max(80),
  genre: z.string(),
  location: z.string(),
});

export const quantitySchema = z.number().int().min(0).max(6);
export const orderIdSchema = z.string().regex(/^TG-\d{5}$/);
export const hexAddressSchema = z.string().regex(/^0x[A-Fa-f0-9]{16,}$/);
export const paymentMethodSchema = z.enum(["CARD", "PAYPAL", "USDC"]);
export const bookingStatusSchema = z.enum(["OPEN", "PENDING", "CONFIRMED"]);
export const paymentStatusSchema = z.enum(["PENDING", "CONFIRMED", "FAILED"]);
export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type CardValues = z.infer<typeof cardSchema>;
export type PaypalValues = z.infer<typeof paypalSchema>;
export type UsdcValues = z.infer<typeof usdcSchema>;
export type SlotValues = z.infer<typeof slotSchema>;
