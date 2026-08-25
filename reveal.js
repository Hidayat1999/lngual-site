/* Lngual — scroll reveal + sticky header state. No dependencies.
   The hidden state lives behind .js-reveal on <html>, which an inline
   bootstrap in each <head> sets synchronously. That bootstrap also reveals
   everything after 2s if this file never boots, so a blocked or failed
   request can never leave the page invisible. */
(function () {
  'use strict';

  function boot() {
    window.__revealBooted = true;

    var items = document.querySelectorAll('.reveal');
    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var i;

    if (reduced || typeof window.IntersectionObserver === 'undefined') {
      for (i = 0; i < items.length; i++) { items[i].classList.add('is-visible'); }
    } else {
      /* The large top margin matters: without it, jumping straight to an
         anchor (privacy.html's contents links do exactly this) never crosses
         a threshold, so skipped-over elements stay at opacity 0 forever. */
      var io = new IntersectionObserver(function (entries, obs) {
        for (var j = 0; j < entries.length; j++) {
          if (!entries[j].isIntersecting) { continue; }
          entries[j].target.classList.add('is-visible');
          obs.unobserve(entries[j].target);
        }
      }, { rootMargin: '9999px 0px -10% 0px', threshold: 0.1 });
      for (i = 0; i < items.length; i++) { io.observe(items[i]); }
    }

    var header = document.querySelector('[data-header]') ||
      document.querySelector('.site-header');
    if (!header) { return; }

    /* The header is sticky and travels over full-bleed dark sections, where
       its light frosted state is unreadable. Flip it to a dark bar instead. */
    var darks = document.querySelectorAll('.theme-dark');
    var stuck = null;
    var overDark = null;
    var queued = false;

    function measure() {
      queued = false;

      var next = (window.pageYOffset || document.documentElement.scrollTop) > 8;
      if (next !== stuck) {
        stuck = next;
        header.classList.toggle('is-stuck', next);
      }

      if (!darks.length) { return; }

      /* Switch on the header's midline, not its edges: one clean swap per
         boundary rather than a flicker while the bar straddles it. */
      var band = header.getBoundingClientRect();
      var mid = band.top + band.height / 2;
      var dark = false;
      for (var k = 0; k < darks.length; k++) {
        var r = darks[k].getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { dark = true; break; }
      }
      if (dark !== overDark) {
        overDark = dark;
        header.classList.toggle('is-over-dark', dark);
      }
    }

    function schedule() {
      if (queued) { return; }
      queued = true;
      if (window.requestAnimationFrame) { window.requestAnimationFrame(measure); }
      else { measure(); }
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    /* Late-loading artwork reflows the page under a restored scroll position. */
    window.addEventListener('load', schedule);
    measure();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
