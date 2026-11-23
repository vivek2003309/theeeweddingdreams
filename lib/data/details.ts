import { MOCK_VENDORS, MOCK_VENUES } from "./mockAdapter";
import type { PublicVendor, PublicVenue } from "./types";

export interface PublicGalleryItem {
  id: string;
  title: string;
  caption: string;
  altText: string;
  aspect: "4/5" | "4/3" | "3/4" | "16/9";
  archMask: boolean;
  posterUrl: string;
  gradient: string;
}

export interface VenueSpaceSpec {
  name: string;
  type: "Outdoor Courtyard" | "Indoor Hall" | "Terrace Pavilion" | "Waterside Lawn";
  capacityLabel: string;
  idealFor: string;
}

export interface PublicVenueDetail extends PublicVenue {
  editorialOverview: string;
  architecturalNote: string;
  suitesCountLabel: string;
  bestSeasons: string;
  spaces: VenueSpaceSpec[];
  amenities: string[];
  conciergeHighlights: string[];
  gallery: PublicGalleryItem[];
}

export interface PublicVendorDetail extends PublicVendor {
  editorialOverview: string;
  craftPhilosophy: string;
  travelScope: string;
  leadTimeNote: string;
  signatureOfferings: Array<{
    title: string;
    description: string;
  }>;
  conciergeHighlights: string[];
  gallery: PublicGalleryItem[];
}

function buildVenueGallery(venue: PublicVenue): PublicGalleryItem[] {
  return [
    {
      id: `${venue.id}-g1`,
      title: `${venue.name} · Main Courtyard`,
      caption: `Golden-hour architectural view in ${venue.city}`,
      altText: `${venue.name} main ceremonial courtyard prepared for sunset rituals.`,
      aspect: "4/5",
      archMask: true,
      posterUrl: venue.posterUrl,
      gradient: venue.visualGradient,
    },
    {
      id: `${venue.id}-g2`,
      title: "Candlelit Sangeet Terrace",
      caption: "Acoustic evening courtyard illuminated with beeswax tapers",
      altText: `Candlelit evening Sangeet terrace at ${venue.name}.`,
      aspect: "4/3",
      archMask: false,
      posterUrl: `/placeholder/gallery/${venue.slug}-sangeet.jpg`,
      gradient: "linear-gradient(145deg, #FAF5EE 0%, #FDEEF2 55%, #F6DCE4 100%)",
    },
    {
      id: `${venue.id}-g3`,
      title: "Morning Mehendi Verandah",
      caption: "Shaded botanical pavilion draped in ivory Chanderi silk",
      altText: `Sunlit morning verandah prepared for Mehendi at ${venue.name}.`,
      aspect: "3/4",
      archMask: true,
      posterUrl: `/placeholder/gallery/${venue.slug}-mehendi.jpg`,
      gradient: "linear-gradient(155deg, #FFF9FA 0%, #FAF5EE 50%, #F7C9D8 100%)",
    },
    {
      id: `${venue.id}-g4`,
      title: "Sacred Mandap Horizon",
      caption: "Carved archways aligned for serene twilight pheras",
      altText: `Sacred lotus mandap framed against ${venue.city} skyline at ${venue.name}.`,
      aspect: "16/9",
      archMask: false,
      posterUrl: `/placeholder/gallery/${venue.slug}-pheras.jpg`,
      gradient: "linear-gradient(135deg, #FDEEF2 0%, #FFF9FA 50%, #FAF5EE 100%)",
    },
    {
      id: `${venue.id}-g5`,
      title: "Formal Silver Banquet",
      caption: "Heirloom dining layout with floral clouds and crystal service",
      altText: `Formal reception dining hall prepared at ${venue.name}.`,
      aspect: "4/3",
      archMask: false,
      posterUrl: `/placeholder/gallery/${venue.slug}-banquet.jpg`,
      gradient: "linear-gradient(150deg, #FFF9FA 0%, #F6DCE4 58%, #FAF5EE 100%)",
    },
    {
      id: `${venue.id}-g6`,
      title: "Heritage Guest Suites",
      caption: "Restored private suites with curated family welcome hampers",
      altText: `Sunlit heritage guest suite interior at ${venue.name}.`,
      aspect: "4/5",
      archMask: true,
      posterUrl: `/placeholder/gallery/${venue.slug}-suites.jpg`,
      gradient: "linear-gradient(145deg, #FAF5EE 0%, #FFF9FA 48%, #FDEEF2 100%)",
    },
  ];
}

function buildVendorGallery(vendor: PublicVendor): PublicGalleryItem[] {
  return [
    {
      id: `${vendor.id}-g1`,
      title: `${vendor.name} · Signature Study`,
      caption: `${vendor.category} craft showcase in ${vendor.city}`,
      altText: `${vendor.name} signature editorial study in ${vendor.city}.`,
      aspect: "4/5",
      archMask: true,
      posterUrl: vendor.posterUrl,
      gradient: vendor.visualGradient,
    },
    {
      id: `${vendor.id}-g2`,
      title: "Material & Texture Palette",
      caption: "Hand-selected textiles, florals, and heirloom finishing",
      altText: `Close-up craft palette curated by ${vendor.name}.`,
      aspect: "4/3",
      archMask: false,
      posterUrl: `/placeholder/gallery/${vendor.slug}-detail.jpg`,
      gradient: "linear-gradient(145deg, #FFF9FA 0%, #FDEEF2 52%, #FAF5EE 100%)",
    },
    {
      id: `${vendor.id}-g3`,
      title: "Processional Moment",
      caption: "Editorial daylight documentation from a curated palace wedding",
      altText: `Celebration installation crafted by ${vendor.name}.`,
      aspect: "3/4",
      archMask: true,
      posterUrl: `/placeholder/gallery/${vendor.slug}-moment.jpg`,
      gradient: "linear-gradient(155deg, #FAF5EE 0%, #F6DCE4 55%, #FFF9FA 100%)",
    },
    {
      id: `${vendor.id}-g4`,
      title: "Evening Atmosphere",
      caption: "Warm high-key glow styled for multi-generational gatherings",
      altText: `Evening celebration showcase by ${vendor.name}.`,
      aspect: "16/9",
      archMask: false,
      posterUrl: `/placeholder/gallery/${vendor.slug}-evening.jpg`,
      gradient: "linear-gradient(140deg, #FDEEF2 0%, #FFF9FA 48%, #F7C9D8 100%)",
    },
  ];
}

export function getVenueDetailBySlug(slug: string): PublicVenueDetail | null {
  const venue = MOCK_VENUES.find((v) => v.slug === slug);
  if (!venue) return null;

  return {
    ...venue,
    editorialOverview: `${venue.name} brings together ${venue.city}'s architectural heritage and unhurried private hospitality. Curated for multi-day Indian wedding celebrations, the estate transitions effortlessly from sunlit morning rituals to candlelit evening receptions.`,
    architecturalNote: `Verified by our concierge team for natural daylight orientation, courtyard acoustics, guest accessibility across generations, and private buyout discretion.`,
    suitesCountLabel: `${Math.max(24, Math.round(venue.capacityMin * 0.35))} Heritage Suites & Pavilions`,
    bestSeasons: "October – March · Golden Hour & Courtyard Evenings",
    spaces: [
      {
        name: "Grand Ceremonial Courtyard",
        type: "Outdoor Courtyard",
        capacityLabel: `${venue.capacityMin}–${venue.capacityMax} guests`,
        idealFor: "Twilight Pheras & Baraat Welcome",
      },
      {
        name: "Chhatri Garden Verandah",
        type: "Terrace Pavilion",
        capacityLabel: `${Math.round(venue.capacityMin * 0.8)}–${Math.round(venue.capacityMax * 0.65)} guests`,
        idealFor: "Daytime Mehendi & High Tea",
      },
      {
        name: "Durbar Conservatory Hall",
        type: "Indoor Hall",
        capacityLabel: `${venue.capacityMin}–${Math.round(venue.capacityMax * 0.85)} guests`,
        idealFor: "Formal Reception & Sangeet Gala",
      },
    ],
    amenities: [
      "Private multi-day buyout option",
      "Curated regional & royal culinary kitchens",
      "Dedicated bridal & groom preparation suites",
      "Acoustic-friendly outdoor courtyards",
      "Valet & private airport transfer staging",
      "Weather-contingency heritage halls",
    ],
    conciergeHighlights: [
      "Personally inspected by The Wedding Dreams hospitality directors",
      "Block rooming, buyout terms, and tastings negotiated on your behalf",
      "No direct sales calls — all communication routed through your concierge",
    ],
    gallery: buildVenueGallery(venue),
  };
}

export function getVendorDetailBySlug(slug: string): PublicVendorDetail | null {
  const vendor = MOCK_VENDORS.find((v) => v.slug === slug);
  if (!vendor) return null;

  return {
    ...vendor,
    editorialOverview: `${vendor.name} is a verified ${vendor.category.toLowerCase()} house based in ${vendor.city}, celebrated for ${vendor.specialty.toLowerCase()} Every commission is accepted selectively so senior artisans remain hands-on throughout your celebration.`,
    craftPhilosophy:
      "Rooted in classical Indian craft yet composed with modern editorial restraint — favouring natural light, tactile materials, and unhurried execution.",
    travelScope: "Delhi NCR · Jaipur · Udaipur · Goa & Destination Buyouts",
    leadTimeNote: "Recommended 4–9 months prior to celebration dates",
    signatureOfferings: [
      {
        title: "Bespoke Concept & Direction",
        description:
          "Tailored mood dossiers, architectural sketches, and cohesive multi-day direction aligned to your chosen estate.",
      },
      {
        title: "Senior Artisan Execution",
        description:
          "Dedicated lead directors on-site from setup through every ceremony, synced directly with our concierge run-sheet.",
      },
      {
        title: "Private Pre-Celebration Preview",
        description:
          "In-person mockup, tasting, or studio fitting hosted alongside your concierge director.",
      },
    ],
    conciergeHighlights: [
      "Portfolio, past celebrations, and business credentials verified by our committee",
      "Consolidated proposals and scheduling coordinated by your single concierge",
      "Zero public pricing or unsolicited follow-ups — introduced privately upon request",
    ],
    gallery: buildVendorGallery(vendor),
  };
}

/**
 * Strictly public JSON-LD structured data (zero phone, email, WhatsApp, or exact prices).
 */
export function buildPublicVenueJsonLd(venue: PublicVenueDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: venue.name,
    description: venue.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: venue.city,
      addressCountry: "IN",
    },
    maximumAttendeeCapacity: venue.capacityMax,
  };
}

export function buildPublicVendorJsonLd(vendor: PublicVendorDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.name,
    description: vendor.specialty,
    areaServed: vendor.city,
    knowsAbout: vendor.category,
  };
}
