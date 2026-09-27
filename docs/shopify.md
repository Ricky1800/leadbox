# Embedding on Shopify

## Site-wide install via `theme.liquid`

1. In the Shopify admin, go to **Online Store → Themes**.
2. On your live theme, click **Edit code** (via the **⋮** menu).
3. Open `layout/theme.liquid`.
4. Find the closing `</body>` tag and paste the script tag just before it:

   ```html
   <script
     src="https://cdn.jsdelivr.net/gh/Ricky1800/leadbox@v0.1.0/dist/leadbox.min.js"
     data-endpoint="YOUR_ENDPOINT_URL"
     data-title="Get a Free Quote"
   ></script>
   ```

5. Click **Save**. This applies the widget to every page of the storefront
   (product pages, collections, the homepage, etc.).

## Single-page install (e.g. only the contact page)

1. Instead of editing `theme.liquid`, open the specific template file used
   by that page (e.g. `templates/page.contact.liquid`, or whichever
   template your "Contact" or "Services" page uses — check **Online Store
   → Pages** to see which template a page is assigned).
2. Paste the same script tag anywhere in that template file.
3. Save.

## Notes

- Shopify themes are updated periodically by their authors; if you use a
  purchased/marketplace theme, prefer creating and editing a **duplicate**
  theme (Shopify's theme list has a "Duplicate" action) so a future theme
  update doesn't silently remove your custom code.
- Shopify's Content Security Policy is generally permissive for
  storefronts, but if your store uses a custom CSP via an app, make sure
  `cdn.jsdelivr.net` (or wherever you host `leadbox.min.js`) is allowed as
  a script source.
- LeadBox is a lead-capture form, not a checkout — it's meant for service
  inquiries ("get a quote," "book a consultation") rather than product
  orders, which Shopify's own cart/checkout already handles.
