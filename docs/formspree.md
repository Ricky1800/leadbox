# Backend: Formspree

[Formspree](https://formspree.io) is a hosted form-backend service with a
generous free tier (50 submissions/month at the time of writing). It's the
fastest way to get LeadBox working if you don't want to touch Google Sheets
or Apps Script at all.

## 1. Create a form

1. Sign up at [formspree.io](https://formspree.io).
2. Click **New Form**, give it a name (e.g. "Website Leads"), and set the
   notification email to wherever you want leads delivered.
3. Formspree gives you an endpoint that looks like:
   `https://formspree.io/f/abcdwxyz`

## 2. Point LeadBox at it

```html
<script
  src="https://cdn.jsdelivr.net/gh/Ricky1800/leadbox@v0.1.0/dist/leadbox.min.js"
  data-endpoint="https://formspree.io/f/abcdwxyz"
  data-encoding="json"
></script>
```

Formspree accepts both JSON and form-encoded bodies, so either
`data-encoding` value works — JSON is the default.

## 3. Test it

Submit the widget once from your live site (or `demo/index.html` pointed
at your real endpoint). Formspree requires confirming your first
submission via a link it emails you — after that, subsequent submissions
flow straight through with no further confirmation.

## Notes

- Formspree's free tier includes basic spam filtering server-side, which
  pairs well with LeadBox's client-side honeypot/timing checks — together
  they cover both naive bots (caught client-side, never even sent) and
  more sophisticated ones (caught server-side).
- For higher volume or custom email templates, Formspree's paid plans add
  more submissions/month and autoresponders. LeadBox doesn't care which
  plan you're on — it's the same endpoint either way.
