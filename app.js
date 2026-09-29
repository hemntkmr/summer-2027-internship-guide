(function () {
  "use strict";

  var STORAGE_KEY = "internship-guide-checks-v1";

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* private mode / quota */ }
  }

  function updateProgress(page) {
    var boxes = document.querySelectorAll(
      '.checklist input[type="checkbox"][data-id]'
    );
    if (!boxes.length) return;
    var total = boxes.length;
    var done = 0;
    boxes.forEach(function (cb) {
      if (cb.checked) done++;
    });
    var fill = document.querySelector('[data-progress-fill="' + page + '"]');
    var label = document.querySelector('[data-progress-label="' + page + '"]');
    var pct = total ? Math.round((done / total) * 100) : 0;
    if (fill) fill.style.width = pct + "%";
    if (label) label.textContent = done + " / " + total + " done (" + pct + "%)";
  }

  function initChecklists() {
    var state = loadState();
    var page =
      document.body.getAttribute("data-page") ||
      (location.pathname.split("/").pop() || "index.html");

    document.querySelectorAll('.checklist input[type="checkbox"][data-id]').forEach(function (cb) {
      var id = cb.getAttribute("data-id");
      var key = page + "::" + id;
      cb.checked = !!state[key];
      var li = cb.closest("li");
      if (li) li.classList.toggle("done", cb.checked);

      cb.addEventListener("change", function () {
        var s = loadState();
        if (cb.checked) s[key] = true;
        else delete s[key];
        saveState(s);
        if (li) li.classList.toggle("done", cb.checked);
        updateProgress(page);
      });
    });

    // Clicking the whole row toggles checkbox (except when clicking links)
    document.querySelectorAll(".checklist li").forEach(function (li) {
      li.addEventListener("click", function (e) {
        if (e.target.tagName === "A" || e.target.tagName === "INPUT") return;
        var cb = li.querySelector('input[type="checkbox"]');
        if (!cb) return;
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event("change"));
      });
    });

    updateProgress(page);

    var resetBtn = document.querySelector("[data-reset-page]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!confirm("Clear checkmarks on this page?")) return;
        var s = loadState();
        var prefix = page + "::";
        Object.keys(s).forEach(function (k) {
          if (k.indexOf(prefix) === 0) delete s[k];
        });
        saveState(s);
        document.querySelectorAll('.checklist input[type="checkbox"][data-id]').forEach(function (cb) {
          cb.checked = false;
          var li = cb.closest("li");
          if (li) li.classList.remove("done");
        });
        updateProgress(page);
      });
    }
  }

  function initMobileNav() {
    var btn = document.querySelector(".menu-btn");
    var sidebar = document.querySelector(".sidebar");
    var overlay = document.querySelector(".overlay");
    if (!btn || !sidebar) return;

    function close() {
      sidebar.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
    }
    function open() {
      sidebar.classList.add("open");
      if (overlay) overlay.classList.add("open");
    }

    btn.addEventListener("click", function () {
      if (sidebar.classList.contains("open")) close();
      else open();
    });
    if (overlay) overlay.addEventListener("click", close);
  }

  function markExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (!a.hasAttribute("target")) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initChecklists();
    initMobileNav();
    markExternalLinks();
  });
})();
