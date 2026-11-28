# WhatsApp message templates (submit in WhatsApp Manager → Message templates)

Language for all: **English** (`en`). Names must match exactly. `{{n}}` are filled in by the website.
Meta reviews each template, usually within a day.

## 1. `booking_confirmed` — category **Utility**
Sent to the customer when a session is booked (only if they ticked "Send my booking updates on WhatsApp").

Body:
```
Hi {{1}}, your Nilepods session is booked! 🎙

📅 {{2}}
🕒 {{3}}
🎧 {{4}} · {{5}}
Ref: {{6}}

A few things to know:
• Please arrive 30 minutes before your session so we can get you set up. Sessions start and end on time.
• No food or drinks inside the studio rooms.
• Only the guests on your booking can come in.
• Phones on silent while recording, please.
• Please treat the equipment with care; damage is charged.
• Need a different time? Move your session from My account up to 48 hours before.

📍 Finding us
We're in the basement. Look for the small metal door on the side of the building with the "438 Basement" sign next to it. Tap "Open studio location" below for directions. Can't find us? Just reply here and we'll guide you.

See you soon!
```
Button: type **Visit website** → URL (static) → `https://maps.app.goo.gl/Z8xQ5h1krpfMB35R9`, button text "Open studio location".

Sample values: Ahmed · Tuesday 2 December · 7 PM to 9 PM · Recording Only · Setup 3 · NP-1A2B3C4D

## 2. `booking_moved` — category **Utility**
Same body and button as above, but the first line is: `Hi {{1}}, your Nilepods session has been moved to a new time. 🎙`

## 3. `operator_booking` — category **Utility**
Sent to every team member marked as operator in Admin → Team & access.
```
Nilepods: {{1}}

📅 {{2}}
🕒 {{3}}
🎙 {{4}} · {{5}}
👤 Client: {{6}} ({{7}})
Ref: {{8}}

Please be at the studio on time to prepare the room.
```
Sample values: New booking · Tuesday 2 December · 7 PM to 9 PM · Recording Only · Setup 3 · Ahmed Ali · 2 on camera, 1 guest · NP-1A2B3C4D

## 4. `account_otp` — category **Authentication**
Choose "One-time passcode", delivery **Copy code**, and tick the security recommendation and the 10-minute expiry.
Meta writes the body itself ("{{1}} is your verification code.").

## Switching it on
1. In Meta Business Manager, connect the studio number to the WhatsApp Cloud API and verify the business.
2. Create a permanent System User token with `whatsapp_business_messaging`.
3. In Supabase → Edge Functions → Secrets add `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_ID`.
4. Once the templates are approved: redeploy checkout, paymob-webhook, reschedule and staff-cancel, and set `WHATSAPP_OTP_ON = true` in `src/site/Logic.js`.
