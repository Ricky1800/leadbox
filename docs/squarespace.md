# Embedding on Squarespace

Custom code injection requires a **Business** plan or higher (Personal
plans don't support the Code Injection panel).

## Site-wide install (recommended)

1. In the Squarespace dashboard, go to **Settings → Advanced → Code
   Injection**.
2. Paste the script tag into the **Footer** box (footer injection runs on
   every page, after the page content, which is the right place for a
   widget like this):

   ```html
   <script
     src="https://cdn.jsdelivr.net/gh/Ricky1800/leadbox@v0.2.0/dist/leadbox.min.js"
     data-endpoint="YOUR_ENDPOINT_URL"
     data-title="Get a Free Quote"
   ></script>
   ```

3. Save. Squarespace applies footer code injection site-wide immediately —
   no separate publish step needed for code injection specifically.

## Single-page install

1. Edit the specific page, add a **Code Block** where you want it (or
   anywhere, since the widget is a fixed-position overlay regardless of
   where its `<script>` tag lives in the page).
2. Paste the same script tag into the Code Block.
3. Save the page.

## Notes

- Squarespace templates are typically strict about horizontal overflow and
  fixed-position elements; LeadBox's trigger button and dialog are
  responsive and tested down to small mobile widths, but if your template
  has an unusual layout, double-check the widget on mobile after adding it.
- If you use Squarespace's built-in cookie consent banner, note that
  LeadBox itself sets no cookies and does no tracking, so it doesn't need
  to wait on consent to function.
