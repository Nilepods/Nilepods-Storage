// Public Paymob settings. These are NOT secret (the public key is meant for browsers).
// The secret key and HMAC secret live only in Supabase -> Edge Functions -> Secrets:
//   PAYMOB_SECRET_KEY, PAYMOB_HMAC_SECRET
//
// GOING LIVE: replace both values below with the LIVE public key and LIVE card
// integration ID, and replace the two secrets with their live versions. All four must
// come from the same mode (test or live).
export const PAYMOB_PUBLIC_KEY = 'egy_pk_test_QNSPflFW7y4R8tJlr111WPuhI88ppkx0';
export const PAYMOB_CARD_INTEGRATION_ID = 6077815; // test mode, "Online Card", EGP

export const PAYMOB_API = 'https://accept.paymob.com';

// Booking emails
export const SITE_URL = 'https://nilepods.com';
export const BOOKINGS_INBOX = 'bookings@nilepods.com';         // receives "new booking" alerts; customers' replies go here
export const SENDER = 'Nilepods <noreply@nilepods.com>';

// Offer "Pay at the studio" (cash). Set to false to make the site card-only.
export const ALLOW_CASH = true;

// Sites allowed to start a checkout, and where customers return after paying.
export const ALLOWED_ORIGINS = [
  'https://preview.nilepods.com',
  'https://nilepods.com',
  'https://www.nilepods.com',
  'http://localhost:5173',
  'http://localhost:4173',
];
