(function () {
  // Read env from the script tag attribute or infer from hostname
  var scriptTag = document.currentScript;
  var env =
    scriptTag && scriptTag.dataset && scriptTag.dataset.env
      ? scriptTag.dataset.env.toLowerCase()
      : "";

  if (!env) {
    // Optional: infer from host if not provided
    env = "prod";
  }

  var src =
    env === "sandbox"
      ? "https://sandbox.web.squarecdn.com/v1/square.js"
      : "https://web.squarecdn.com/v1/square.js";

  // If already loaded (hot reload etc.), don’t load twice
  if (window.Square && window.__squareEnv === env) {
    window.dispatchEvent(new Event("square-sdk-ready"));
    return;
  }

  var s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.onload = function () {
    window.__squareEnv = env;
    // Signal to app code that SDK is ready
    window.dispatchEvent(new Event("square-sdk-ready"));
    // Optional: expose a promise for convenience
    if (!window.squareReady) {
      var resolveFn;
      window.squareReady = new Promise(function (resolve) {
        resolveFn = resolve;
      });
      resolveFn(); // resolve immediately since we're already loaded
    }
    // Helpful log
    try {
      console.log("[Square] Loaded:", src, "env:", env);
    } catch (_) {}
  };
  s.onerror = function () {
    try {
      console.error("[Square] Failed to load:", src);
    } catch (_) {}
    window.dispatchEvent(new Event("square-sdk-error"));
  };
  document.head.appendChild(s);

  // Create the promise if not present, resolve when onload fires
  if (!window.squareReady) {
    var _resolve;
    window.squareReady = new Promise(function (resolve) {
      _resolve = resolve;
    });
    window.addEventListener(
      "square-sdk-ready",
      function () {
        _resolve();
      },
      { once: true }
    );
  }
})();
