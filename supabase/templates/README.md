# Sign-in email templates

Installed in Supabase -> Authentication -> Emails -> Templates (sent via Brevo SMTP as
"Nilepods" <noreply@nilepods.com>, configured under SMTP Settings).

| File | Supabase template | Subject |
|---|---|---|
| magic_link.html | Magic link or OTP | Your Nilepods sign-in link |
| confirm_signup.html | Confirm sign up (first sign-in of a new email) | Welcome to Nilepods - confirm your email |

Variables: `{{ .ConfirmationURL }}`, `{{ .Email }}`. To change a template, edit the file,
then paste it into the matching template in the Supabase dashboard.
