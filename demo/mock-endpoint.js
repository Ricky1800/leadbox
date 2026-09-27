/**
 * Demo-only mock backend. GitHub Pages can only serve static files, so
 * instead of a real receiver this script intercepts `fetch()` calls aimed
 * at the fake endpoint below, "stores" the lead in memory, and renders it
 * into the "Recent submissions" panel on the page — so visitors can see the
 * full round trip (validation -> submit -> your backend receives it)
 * without any server existing behind the scenes.
 *
 * This file is intentionally excluded from the published widget bundle —
 * it's demo scaffolding only, never something a real integrator needs.
 */
(function () {
  var MOCK_ENDPOINT = 'https://demo.leadbox.invalid/api/leads';
  var realFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : input && input.url;
    if (url !== MOCK_ENDPOINT) {
      return realFetch(input, init);
    }

    return new Promise(function (resolve) {
      setTimeout(function () {
        try {
          var body = init && init.body ? String(init.body) : '';
          var contentType = (init && init.headers && init.headers['Content-Type']) || '';
          var lead =
            contentType.indexOf('application/json') !== -1
              ? JSON.parse(body)
              : Object.fromEntries(new URLSearchParams(body));
          renderSubmission(lead);
        } catch (err) {
          console.error('[demo mock endpoint] failed to parse submitted lead', err);
        }
        resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
      }, 600); // simulate realistic network latency
    });
  };

  /**
   * @param {Record<string, string>} lead
   */
  function renderSubmission(lead) {
    var list = document.getElementById('submissions');
    if (!list) return;
    var empty = document.getElementById('submissions-empty');
    if (empty) empty.remove();

    var item = document.createElement('li');
    item.className = 'submission';
    var fields = ['name', 'phone', 'email', 'service', 'message', 'preferredContact', 'submittedAt'];
    var html = fields
      .filter(function (f) {
        return lead[f];
      })
      .map(function (f) {
        return '<strong>' + f + ':</strong> ' + escapeHtml(lead[f]);
      })
      .join('<br>');
    item.innerHTML = html || '<em>(empty submission)</em>';
    list.prepend(item);
  }

  /**
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  window.LEADBOX_DEMO_ENDPOINT = MOCK_ENDPOINT;
})();
