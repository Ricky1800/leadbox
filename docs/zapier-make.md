# Backend: Zapier / Make (webhooks)

Both [Zapier](https://zapier.com) and [Make](https://www.make.com) (formerly
Integromat) let you receive a webhook and fan it out to almost anything —
a CRM, Slack, email, another spreadsheet, SMS, you name it. This is the
right choice when Google Sheets or Formspree alone isn't enough and you
want the lead routed somewhere specific.

## Zapier

1. Create a new Zap. For the trigger, search for **Webhooks by Zapier** and
   choose **Catch Hook**.
2. Zapier gives you a unique URL like
   `https://hooks.zapier.com/hooks/catch/123456/abcdef/`.
3. Use that as the widget's endpoint:

   ```html
   <script
     src="https://cdn.jsdelivr.net/gh/Ricky1800/leadbox@v0.2.0/dist/leadbox.min.js"
     data-endpoint="https://hooks.zapier.com/hooks/catch/123456/abcdef/"
     data-encoding="json"
   ></script>
   ```

4. Submit the widget once from your site — Zapier needs one real sample
   request to detect the field names before you can build the rest of the
   Zap.
5. Back in Zapier, click **Test trigger** to pull in that sample, then add
   an action step (e.g. "Google Sheets: Create Spreadsheet Row",
   "HubSpot: Create Contact", "Slack: Send Channel Message", email, etc.)
   and map the fields (`name`, `phone`, `email`, `message`, `service`,
   `preferredContact`, `pageUrl`, `referrer`, `utm_source`, ...).
6. Turn the Zap on.

## Make (Integromat)

1. Create a new scenario and add a **Webhooks → Custom webhook** module as
   the trigger. Create a new webhook, and Make gives you a URL.
2. Use that URL as the widget's `endpoint` the same way as above.
3. Submit the widget once from your site, then click **Run once** in Make
   so it captures the payload structure.
4. Add downstream modules (Google Sheets, a CRM, email, SMS, etc.) and map
   the fields from the webhook's output bundle.
5. Turn the scenario on (and consider its scheduling — "Immediately" for
   real-time lead routing).

## Field reference

Whichever payload fields you enabled via `data-fields`, LeadBox always adds
these on top so you can route/segment without extra work:

| Field          | Description                                   |
| -------------- | ---------------------------------------------- |
| `pageUrl`      | The page the form was submitted from            |
| `referrer`     | `document.referrer` at submit time              |
| `utm_source`   | From the page's query string, if present        |
| `utm_medium`   | From the page's query string, if present        |
| `utm_campaign` | From the page's query string, if present        |
| `utm_term`     | From the page's query string, if present         |
| `utm_content`  | From the page's query string, if present         |
| `submittedAt`  | ISO 8601 timestamp of the submission             |

## Notes

- Both services support `application/json` and
  `application/x-www-form-urlencoded` — either `data-encoding` works.
- Zapier/Make's own webhook infra doesn't reject requests based on CORS the
  way some servers do, so you generally won't hit CORS issues here.
- For genuinely high lead volume, consider adding a spam/verification step
  in the Zap/scenario itself (e.g. an email-verification action) in
  addition to LeadBox's client-side honeypot and timing checks.
