# Embedding on WordPress

There are two common ways to add a script tag to WordPress, depending on
whether you can edit the theme.

## Option A: Theme editor / child theme (`footer.php`)

1. In wp-admin, go to **Appearance → Theme File Editor** (or edit your
   child theme's `footer.php` directly via FTP/hosting file manager).
2. Find the closing `</body>` tag in `footer.php`.
3. Paste the LeadBox script tag just before it:

   ```html
   <script
     src="https://cdn.jsdelivr.net/gh/Ricky1800/leadbox@v0.1.0/dist/leadbox.min.js"
     data-endpoint="YOUR_ENDPOINT_URL"
     data-title="Get a Free Quote"
     data-accent-color="#2563eb"
   ></script>
   ```

4. Save. The button should now appear on every page using that theme.

> Editing theme files directly can be overwritten by theme updates. Prefer
> a child theme, or Option B below, if you update your theme often.

## Option B: "Insert Headers and Footers" plugin (no code editing)

1. Install a plugin such as **WPCode** or **Insert Headers and Footers**
   (both free, in the WordPress plugin directory).
2. Go to the plugin's settings page, find the **Footer** box, and paste in
   the same script tag from Option A.
3. Save. This survives theme updates since it's stored separately from the
   theme.

## Elementor / page-builder-only embed

If you only want the widget on one specific page (not site-wide):

1. Edit that page in Elementor (or your builder of choice).
2. Add an **HTML** widget/element anywhere on the page.
3. Paste the script tag into it.

## Notes

- WordPress often loads jQuery and various theme scripts that could
  otherwise clash with a form widget — LeadBox avoids this entirely by
  rendering inside a Shadow DOM, so no WordPress theme or plugin CSS/JS can
  reach in and restyle or break it.
- If your WordPress site is behind a caching plugin, purge the cache after
  adding the script tag so the change goes live for visitors immediately.
