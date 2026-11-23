import { z } from "zod";

export const quickSearchSchema = z.object({
  mode: z.enum(["venue", "vendor"]),
  city: z.enum(["all", "delhi-ncr", "jaipur", "udaipur", "goa"]),
  celebrationMonth: z.string().max(40).optional(),
  guestBand: z.enum(["intimate", "medium", "grand", "royal"]),
});

export type QuickSearchValues = z.infer<typeof quickSearchSchema>;

export const conciergeEnquirySchema = z.object({
  interestType: z.enum(["venue", "vendor", "complete-wedding"]),
  listingTitle: z.string().max(120).optional(),
  city: z.enum(["delhi-ncr", "jaipur", "udaipur", "goa", "other"]),
  celebrationDate: z.string().min(3, "Please share a preferred month or date."),
  guestCount: z.enum(["under-100", "100-250", "250-500", "500-plus"]),
  tier: z.enum(["classic", "grand", "royal"]),
  briefNotes: z.string().max(1200).optional(),
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  phone: z
    .string()
    .min(7, "Please enter a contact number for our concierge.")
    .max(20, "Contact number looks too long."),
  consent: z.boolean().refine((v) => v === true, {
    message: "Please confirm consent so our concierge may reach out.",
  }),
  humanVerified: z.boolean().refine((v) => v === true, {
    message: "Please complete the quick human verification check.",
  }),
  websiteHoneypot: z.string().max(0).optional(),
});

export type ConciergeEnquiryValues = z.infer<typeof conciergeEnquirySchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export type NewsletterValues = z.infer<typeof newsletterSchema>;

export const celebrationBriefRequestSchema = z.object({
  city: z.string().min(2).max(60),
  guestCount: z.string().min(2).max(40),
  tier: z.enum(["classic", "grand", "royal"]),
  chapters: z.array(z.string()).min(1).max(6),
  visionPrompt: z
    .string()
    .min(10, "Please share a few details about your celebration vision.")
    .max(1500),
});

export type CelebrationBriefRequest = z.infer<
  typeof celebrationBriefRequestSchema
>;

export const partnerApplicationSchema = z.object({
  role: z.enum(["venue-owner", "vendor"]),
  brandName: z.string().min(2, "Please enter your venue or studio name."),
  city: z.enum(["delhi-ncr", "jaipur", "udaipur", "goa", "other"]),
  categoryOrSetting: z.string().min(2, "Please specify a primary category or setting."),
  yearsActive: z.string().min(1, "Please note your years of heritage or practice."),
  brandSummary: z
    .string()
    .min(12, "Please share a short introduction to your property or craft.")
    .max(600),
  portfolioLinks: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .refine(
            (val) => val === "" || /^https?:\/\/.+/i.test(val),
            "Please enter a valid https:// video or portfolio link."
          ),
      })
    )
    .max(5, "You may attach up to 5 4K showreel links."),
  galleryNotes: z.string().max(300).optional(),
  tier: z.enum(["classic", "grand", "royal"]),
  capacityBand: z.enum(["under-100", "100-250", "250-500", "500-plus"]),
  contactName: z.string().min(2, "Please enter an authorized contact name."),
  email: z.string().email("Please enter a valid business email."),
  phone: z.string().min(7, "Please enter a private business phone number.").max(20),
  gstNumber: z.string().min(5, "Please provide a valid GST or business registration reference."),
  consent: z.boolean().refine((v) => v === true, {
    message: "Please acknowledge our verification and confidentiality policy.",
  }),
  humanVerified: z.boolean().refine((v) => v === true, {
    message: "Please complete the quick human verification check.",
  }),
  websiteHoneypot: z.string().max(0).optional(),
});

export type PartnerApplicationValues = z.infer<typeof partnerApplicationSchema>;

export const partnerStatusLookupSchema = z.object({
  referenceId: z
    .string()
    .trim()
    .min(5, "Please enter your reference ID (e.g. TWD-P1042)."),
  email: z.string().email("Please enter the business email used on your application."),
});

export type PartnerStatusLookupValues = z.infer<typeof partnerStatusLookupSchema>;
