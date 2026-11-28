# WhatsApp message templates (submit in WhatsApp Manager → Message templates)

Language for all: **English** (`en`). Names must match exactly. `{{n}}` are filled in by the website.
Meta reviews each template, usually within a day.

## 1. `booking_confirmed` — category **Utility**
Sent to the customer when a session is booked (only if they ticked "Send my booking updates on WhatsApp").

Body:
```
Hi {{1}}, your Nilepods session is booked!

📅 {{2}}
🕒 {{3}}
🎙 {{4}} · {{5}}
Booking ref: {{6}}

Before you come:
[STUDIO RULES GO HERE]

Please arrive 10 minutes early. See you at the studio!
```
Button: **Visit website** → URL (static) → `[GOOGLE MAPS LINK]`, button text "Open studio location".

Sample values: Ahmed · Tuesday 2 December · 7 PM to 9 PM · Recording Only · Setup 3 · NP-1A2B3C4D

## 2. `booking_moved` — category **Utility**
Same as above, but the first line is: `Hi {{1}}, your Nilepods session has been moved to a new time.`

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
