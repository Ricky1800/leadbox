# Embedding on Wix

Wix requires a **Premium plan** to add custom code (the free plan doesn't
allow custom `<script>` tags site-wide).

## Site-wide install (recommended)

1. In the Wix Editor, go to **Settings → Custom Code** (sometimes found
   under **Settings → Advanced → Custom Code**, depending on your Wix
   version).
2. Click **+ Add Custom Code**.
3. Paste the script tag:

   ```html
   <script
     src="https://cdn.jsdelivr.net/gh/Ricky1800/leadbox@v0.2.0/dist/leadbox.min.js"
     data-endpoint="YOUR_ENDPOINT_URL"
     data-title="Get a Free Quote"
   ></script>
   ```

4. Set **Add Code to Pages**: choose **All pages**.
5. Set **Place Code in**: choose **Body - end** (so the widget mounts after
   the rest of the page has loaded).
6. Click **Apply**, then **Publish** your site.

## Single-page install

If you only want the widget on one page, choose that specific page instead
of "All pages" in step 4 above — Wix lets you scope custom code per page.

## Notes

- Wix's own site chrome (headers, popups) can sometimes sit at a high
  z-index. LeadBox's trigger button uses a very high `z-index` internally,
  but if a specific Wix element still overlaps it, try `data-position`
  values (`bottom-left`, `top-right`, `top-left`) to avoid the conflict.
- Changes to Custom Code only take effect after **Publish** — the Wix
  preview mode does not always execute custom `<script>` tags the same way
  as the live site.
