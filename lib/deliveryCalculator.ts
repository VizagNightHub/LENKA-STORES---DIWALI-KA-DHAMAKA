export interface DeliveryRates {
  packingCharge: number;
  hyderabadLocal: number;
  telanganaNear: number;
  telanganaRest: number;
  apCentral: number;
  apNorthVizag: number;
}

export const DEFAULT_RATES: DeliveryRates = {
  packingCharge: 50,
  hyderabadLocal: 79,   // 500xxx (KPHB / Hyderabad)
  telanganaNear: 149,   // 501, 502, 508, 509
  telanganaRest: 199,   // 503 - 507
  apCentral: 249,       // 515 - 524 (Vijayawada, Guntur, Tirupati, etc.)
  apNorthVizag: 299,    // 530 - 535 (Visakhapatnam, Rajahmundry, Srikakulam)
};

export function calculateDeliveryFromKPHB(
  pincode: string,
  rates: DeliveryRates = DEFAULT_RATES
): { charge: number; zoneLabel: string; valid: boolean } {
  const clean = pincode.trim();
  if (!/^\d{6}$/.test(clean)) {
    return { charge: 0, zoneLabel: "Enter 6-digit pincode", valid: false };
  }

  const prefix3 = Number(clean.slice(0, 3));

  if (prefix3 === 500) {
    return { charge: rates.hyderabadLocal, zoneLabel: "Hyderabad Local (from KPHB)", valid: true };
  }
  if ([501, 502, 508, 509].includes(prefix3)) {
    return { charge: rates.telanganaNear, zoneLabel: "Telangana Metro & Outskirts", valid: true };
  }
  if (prefix3 >= 503 && prefix3 <= 507) {
    return { charge: rates.telanganaRest, zoneLabel: "Telangana Regional", valid: true };
  }
  if (prefix3 >= 515 && prefix3 <= 524) {
    return { charge: rates.apCentral, zoneLabel: "Andhra Pradesh (Central & South)", valid: true };
  }
  if (prefix3 >= 530 && prefix3 <= 535) {
    return { charge: rates.apNorthVizag, zoneLabel: "Visakhapatnam & North Coastal AP", valid: true };
  }

  return { charge: rates.apNorthVizag, zoneLabel: "Outside AP/TS Standard Zone", valid: true };
}
