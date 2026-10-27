// Counts clicks on outbound and key links as GoatCounter "events" (cookieless, no personal data).
// Name: click/<where on the page>/<destination>, e.g. click/community/discord, click/footer/docs.
// Override either part on a link with data-track="where/destination".
(function () {
  var DEST = [
    [/^docs\.nanoframework\.net/, 'docs'],
    [/^marketplace\.visualstudio\.com.*vscode/i, 'extension-vscode'],
    [/^marketplace\.visualstudio\.com/, 'extension-visual-studio'],
    [/^discord\.(gg|com)/, 'discord'],
    [/^github\.com\/sponsors/, 'github-sponsors'],
    [/^github\.com\/nanoframework\/nanoFirmwareFlasher/i, 'nanoff'],
    [/^github\.com\/nanoframework/, 'github'],
    [/^opencollective\.com/, 'open-collective'],
    [/^(www\.)?youtube\.com/, 'youtube'],
    [/^(www\.)?hackster\.io/, 'hackster'],
    [/^(www\.)?nuget\.org/, 'nuget'],
    [/^(www\.)?(x|twitter)\.com/, 'x'],
  ];
  var INTERNAL = [
    [/^\/support-nanoframework\//, 'support'],
    [/^\/partner-program\//, 'partners'],
  ];
  var IGNORE = /^(creativecommons\.org|goatcounter\.com)$/;
  function slug(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40).replace(/-$/, '');
  }
  function where(a) {
    if (a.closest('header')) return 'header';
    if (a.closest('footer')) return 'footer';
    var s = a.closest('section');
    if (s) {
      if (s.id) return s.id;
      if (s.classList.contains('hero')) return 'hero';
      var h = s.querySelector('h1, h2');
      if (h) return slug(h.textContent);
    }
    return a.closest('article') ? 'article' : 'page';
  }
  function dest(a) {
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return null; }
    if (u.protocol === 'mailto:') return 'email';
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    var key = u.hostname + u.pathname + u.search;
    if (IGNORE.test(u.hostname.replace(/^www\./, ''))) return null;
    if (u.hostname === location.hostname) {
      if (u.pathname === location.pathname) return null; // in-page anchors and skip links
      for (var i = 0; i < INTERNAL.length; i++) if (INTERNAL[i][0].test(u.pathname)) return INTERNAL[i][1];
      return null; // plain internal navigation is already a page view
    }
    for (var j = 0; j < DEST.length; j++) if (DEST[j][0].test(key)) return DEST[j][1];
    return 'external-' + u.hostname.replace(/^www\./, '');
  }
  function track(e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a || !window.goatcounter || !window.goatcounter.count) return;
    var name = a.getAttribute('data-track');
    if (!name) {
      var d = dest(a);
      if (!d) return;
      name = where(a) + '/' + d;
    }
    window.goatcounter.count({ event: true, path: 'click/' + name, title: (a.textContent || '').trim().slice(0, 80) });
  }
  document.addEventListener('click', track, true);
  document.addEventListener('auxclick', track, true); // middle-click / open in new tab
})();
