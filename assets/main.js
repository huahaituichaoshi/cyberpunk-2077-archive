/* NET ARCHIVE // 轻量交互
   1. 顶栏当前页高亮（双保险：页面已写 aria-current，这里处理遗漏）
   2. 窄屏时把当前页导航项滚进可视区
   3. 顶栏右侧系统时间
*/
(function () {
  "use strict";

  var nav = document.querySelector(".nav");
  if (nav) {
    var here = location.pathname.split("/").pop() || "index.html";
    var links = nav.querySelectorAll("a");
    var current = null;

    links.forEach(function (a) {
      var target = (a.getAttribute("href") || "").split("/").pop();
      if (target === here || (here === "" && target === "index.html")) {
        a.setAttribute("aria-current", "page");
        current = a;
      }
    });

    if (current && current.scrollIntoView) {
      try {
        current.scrollIntoView({ block: "nearest", inline: "center" });
      } catch (e) {
        /* noop */
      }
    }
  }

  var clock = document.getElementById("sys-clock");
  if (clock) {
    var tick = function () {
      var d = new Date();
      var hh = String(d.getHours()).padStart(2, "0");
      var mm = String(d.getMinutes()).padStart(2, "0");
      clock.textContent = hh + ":" + mm;
    };
    tick();
    setInterval(tick, 30000);
  }

  // 全站循环扫描线（HUD 动态感）
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var scan = document.createElement("div");
    scan.className = "scanline";
    scan.setAttribute("aria-hidden", "true");
    document.body.insertBefore(scan, document.body.firstChild);
  }
})();
