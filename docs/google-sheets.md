# Backend: Google Sheets (free, no server required)

This turns a Google Sheet into a lead inbox: every LeadBox submission
appends a row, and you can optionally get an email the moment a new lead
comes in. It runs entirely on Google's infrastructure, so there's nothing
to host, deploy, or pay for at typical small-business volume.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet. Name it something like "Website Leads".
2. You don't need to create any tabs or headers by hand — the script below
   creates a `Leads` tab with headers automatically the first time it runs.

## 2. Add the Apps Script

1. In the Sheet, open **Extensions → Apps Script**.
2. Delete the placeholder `myFunction() {}` code.
3. Copy the entire contents of
   [`examples/google-sheets-receiver.gs`](../examples/google-sheets-receiver.gs)
   from this repo and paste it in.
4. (Optional) Set `NOTIFY_EMAIL` near the top of the script to your email
   address if you want a notification for every new lead.
5. Save the project (File → Save, or Ctrl/Cmd+S). Give it a name like
   "LeadBox Receiver" when prompted.

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Description**: `LeadBox receiver` (or anything you like)
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**.
5. Google will ask you to authorize the script (it's your own script, so
   this is expected) — click through the "Google hasn't verified this app"
   warning via **Advanced → Go to LeadBox Receiver (unsafe)**. This warning
   appears for every personal Apps Script project; you're authorizing your
   own script to edit your own Sheet.
6. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Point LeadBox at it

Use that URL as the `endpoint`:

```html
<script
  src="https://cdn.jsdelivr.net/gh/Ricky1800/leadbox@v0.2.0/dist/leadbox.min.js"
  data-endpoint="https://script.google.com/macros/s/AKfycb.../exec"
  data-encoding="form"
></script>
```

`data-encoding="form"` is recommended for Apps Script since it avoids a
CORS preflight request that Apps Script web apps don't handle. JSON also
works, but form-encoding is the simplest path.

## 5. Test it

1. Open your site (or `demo/index.html`) and submit the form.
2. Refresh the Google Sheet — a new row should appear in the `Leads` tab
   within a few seconds.
3. If nothing shows up, open **Executions** in the Apps Script editor
   (left sidebar) to see the request and any error it hit.

## Updating the script later

If you edit `google-sheets-receiver.gs` again (e.g. to change `COLUMNS`),
you need to create a **new deployment version** for the change to take
effect: **Deploy → Manage deployments → edit (pencil icon) → New version →
Deploy**. Editing the code alone does not update an already-deployed web
app.

## Limitations

- Apps Script web apps have a daily execution quota on free/personal
  Google accounts (generous for small-business lead volume, but worth
  knowing about if you expect very high traffic).
- There's no built-in de-duplication — if a visitor double-clicks submit
  before the button disables, you could get two rows. LeadBox disables the
  submit button during the request to make this unlikely.
- Treat this as a lightweight, zero-cost backend, not a CRM. For anything
  more involved, see [Zapier/Make](./zapier-make.md) to pipe leads into a
  real CRM alongside (or instead of) the Sheet.
