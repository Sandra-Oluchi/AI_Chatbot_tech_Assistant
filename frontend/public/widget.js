(function () {
  var WIDGET_ID = "zubevision-academy-chatbot-widget";
  var SCRIPT_ID = "zubevision-academy-chatbot-script";
  var DEFAULT_WIDGET_ORIGIN = "http://127.0.0.1:3015";
  var WIDGET_PATH = "/chatwidget?embed=1";

  if (document.getElementById(WIDGET_ID)) {
    return;
  }

  var currentScript = document.currentScript || document.getElementById(SCRIPT_ID);
  var widgetOrigin =
    (currentScript && currentScript.getAttribute("data-widget-origin")) ||
    DEFAULT_WIDGET_ORIGIN;
  var position =
    (currentScript && currentScript.getAttribute("data-position")) || "right";

  var iframe = document.createElement("iframe");
  iframe.id = WIDGET_ID;
  iframe.src = widgetOrigin.replace(/\/$/, "") + WIDGET_PATH;
  iframe.title = "ZubeVision Tech Academy AI Assistant";
  iframe.loading = "lazy";
  iframe.allow = "clipboard-write";

  iframe.style.position = "fixed";
  iframe.style.bottom = "20px";
  iframe.style.width = "760px";
  iframe.style.height = "620px";
  iframe.style.maxWidth = "calc(100vw - 24px)";
  iframe.style.maxHeight = "calc(100vh - 24px)";
  iframe.style.border = "0";
  iframe.style.background = "transparent";
  iframe.style.zIndex = "999999";
  iframe.style.colorScheme = "normal";

  if (position === "left") {
    iframe.style.left = "20px";
  } else {
    iframe.style.right = "20px";
  }

  function fitMobileWidget() {
    if (window.innerWidth <= 480) {
      iframe.style.left = "12px";
      iframe.style.right = "12px";
      iframe.style.bottom = "12px";
      iframe.style.width = "calc(100vw - 24px)";
      iframe.style.height = "calc(100vh - 24px)";
    } else {
      iframe.style.left = position === "left" ? "20px" : "";
      iframe.style.right = position === "left" ? "" : "20px";
      iframe.style.bottom = "20px";
      iframe.style.width = "760px";
      iframe.style.height = "620px";
    }
  }

  fitMobileWidget();
  window.addEventListener("resize", fitMobileWidget);

  document.body.appendChild(iframe);
})();
