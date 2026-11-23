"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { BudgetTier, CitySlug, PartnerStatusRecord } from "@/lib/data/types";
import { MOCK_PARTNER_STATUS_SEED } from "@/lib/data/mockAdapter";
import { ConciergeEnquiryDrawer } from "./ConciergeEnquiryDrawer";
import { PartnerApplicationDrawer } from "./PartnerApplicationDrawer";

export interface EnquiryPrefill {
  interestType?: "venue" | "vendor" | "complete-wedding";
  listingTitle?: string;
  city?: CitySlug | "other";
  celebrationDate?: string;
  guestCount?: "under-100" | "100-250" | "250-500" | "500-plus";
  tier?: BudgetTier;
  chapterName?: string;
}

interface ConciergeContextValue {
  openEnquiry: (prefill?: EnquiryPrefill) => void;
  closeEnquiry: () => void;
  openPartnerDrawer: () => void;
  closePartnerDrawer: () => void;
  isEnquiryOpen: boolean;
  isPartnerOpen: boolean;
  partnerRecords: PartnerStatusRecord[];
  registerPartnerRecord: (record: PartnerStatusRecord) => void;
}

const ConciergeContext = createContext<ConciergeContextValue>({
  openEnquiry: () => {},
  closeEnquiry: () => {},
  openPartnerDrawer: () => {},
  closePartnerDrawer: () => {},
  isEnquiryOpen: false,
  isPartnerOpen: false,
  partnerRecords: MOCK_PARTNER_STATUS_SEED,
  registerPartnerRecord: () => {},
});

export function useConcierge() {
  return useContext(ConciergeContext);
}

export function ConciergeProvider({ children }: { children: React.ReactNode }) {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isPartnerOpen, setIsPartnerOpen] = useState(false);
  const [prefill, setPrefill] = useState<EnquiryPrefill | undefined>(undefined);
  const [partnerRecords, setPartnerRecords] = useState<PartnerStatusRecord[]>(
    MOCK_PARTNER_STATUS_SEED
  );

  const openEnquiry = useCallback((nextPrefill?: EnquiryPrefill) => {
    setIsPartnerOpen(false);
    setPrefill(nextPrefill);
    setIsEnquiryOpen(true);
  }, []);

  const closeEnquiry = useCallback(() => {
    setIsEnquiryOpen(false);
  }, []);

  const openPartnerDrawer = useCallback(() => {
    setIsEnquiryOpen(false);
    setIsPartnerOpen(true);
  }, []);

  const closePartnerDrawer = useCallback(() => {
    setIsPartnerOpen(false);
  }, []);

  const registerPartnerRecord = useCallback((record: PartnerStatusRecord) => {
    setPartnerRecords((prev) => [record, ...prev]);
  }, []);

  return (
    <ConciergeContext.Provider
      value={{
        openEnquiry,
        closeEnquiry,
        openPartnerDrawer,
        closePartnerDrawer,
        isEnquiryOpen,
        isPartnerOpen,
        partnerRecords,
        registerPartnerRecord,
      }}
    >
      {children}
      <ConciergeEnquiryDrawer
        open={isEnquiryOpen}
        prefill={prefill}
        onClose={closeEnquiry}
      />
      <PartnerApplicationDrawer
        open={isPartnerOpen}
        onClose={closePartnerDrawer}
        onApplicationSubmitted={registerPartnerRecord}
      />
    </ConciergeContext.Provider>
  );
}
