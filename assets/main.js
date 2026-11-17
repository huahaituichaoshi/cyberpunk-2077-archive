/* NET ARCHIVE // 轻量交互
   1. 顶栏当前页高亮（双保险：页面已写 aria-current，这里处理遗漏）
   2. 窄屏时把当前页导航项滚进可视区
   3. 顶栏右侧系统时间
   4. 开场 splash：每个会话只播一次，点击或按键即可跳过
   5. 全站循环扫描线
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

  // 开场 splash：每次打开首页都播一次，点击或按键可提前跳过
  var splash = document.querySelector(".splash");
  if (splash) {
    document.body.classList.add("booting");
    var closeSplash = function () {
      splash.classList.add("is-done");
      document.body.classList.remove("booting");
    };
    splash.addEventListener("animationend", function (e) {
      // 子元素的动画结束事件会冒泡上来，只认遮罩自己的那一场
      if (e.target === splash) closeSplash();
    });
    splash.addEventListener("click", closeSplash);
    document.addEventListener("keydown", closeSplash, { once: true });
    // 兜底：动画被系统跳过时也要放行
    setTimeout(closeSplash, 2900);
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 顶部阅读进度条
  if (!reduce) {
    var bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var queued = false;
    var updateBar = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = "scaleX(" + p + ")";
      queued = false;
    };
    window.addEventListener("scroll", function () {
      if (!queued) {
        queued = true;
        requestAnimationFrame(updateBar);
      }
    }, { passive: true });
    updateBar();
  }

  // 滚动进场：给每个区块加 .reveal，进入视口后依次浮现
  if (!reduce && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-motion");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    document.querySelectorAll(".section .wrap").forEach(function (wrap) {
      Array.prototype.forEach.call(wrap.children, function (el, i) {
        el.classList.add("reveal");
        el.style.setProperty("--d", Math.min(i, 5) * 70 + "ms");
        io.observe(el);
      });
    });

    // 兜底：若观察者回调迟迟未触发（个别浏览器/后台标签），1.5s 后直接点亮，避免内容被隐藏
    setTimeout(function () {
      Array.prototype.forEach.call(
        document.querySelectorAll(".reveal:not(.is-in)"),
        function (el) { el.classList.add("is-in"); }
      );
      io.disconnect();
    }, 1500);
  }

  // 站内跳转过场：遮罩自下升起，再切到下一页
  if (!reduce) {
    var veil = document.createElement("div");
    veil.className = "veil";
    veil.setAttribute("aria-hidden", "true");
    veil.innerHTML = '<span class="veil-txt">CONNECTING · NIGHT CITY</span>';
    document.body.appendChild(veil);

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;

      var href = a.getAttribute("href") || "";
      if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
      if (href.charAt(0) === "#" || /^(https?:|mailto:|tel:)/i.test(href)) return;

      e.preventDefault();
      document.documentElement.classList.add("is-leaving");
      setTimeout(function () {
        location.href = href;
      }, 430);
    });

    // 浏览器后退时可能从缓存恢复，别让遮罩留在页面上
    window.addEventListener("pageshow", function () {
      document.documentElement.classList.remove("is-leaving");
    });
  }

  // 背景音乐：默认关闭，点了才加载；跨页面记住开关与进度
  var topbarIn = document.querySelector(".topbar-in");
  if (topbarIn) {
    var audioBtn = document.createElement("button");
    audioBtn.type = "button";
    audioBtn.className = "audio-btn";
    audioBtn.textContent = "♪";
    audioBtn.setAttribute("aria-pressed", "false");
    audioBtn.setAttribute("aria-label", "开启背景音乐");
    audioBtn.title = "开启背景音乐";

    var audioWrap = document.createElement("div");
    audioWrap.className = "audio-wrap";
    var audioTip = document.createElement("div");
    audioTip.className = "audio-tip";
    audioTip.innerHTML = "<b>点这里开声音</b><span>AMBIENT · 夜间环境音</span>";
    audioWrap.appendChild(audioBtn);
    audioWrap.appendChild(audioTip);

    var metaEl = topbarIn.querySelector(".topbar-meta");
    topbarIn.insertBefore(audioWrap, metaEl || null);

    var bgm = new Audio("assets/audio/night-city-loop.mp3");
    bgm.loop = true;
    bgm.preload = "none";
    bgm.volume = 0;

    var STORE_ON = "nc-audio-on";
    var STORE_T = "nc-audio-t";
    var wantedOn = false;
    var blocked = false;
    var resumeAt = 0;
    var lastSave = 0;

    try {
      wantedOn = localStorage.getItem(STORE_ON) === "1";
      resumeAt = parseFloat(localStorage.getItem(STORE_T) || "0") || 0;
    } catch (e) {
      /* 隐私模式忽略 */
    }

    var hideTip = function () {
      audioTip.classList.remove("is-show");
      try {
        sessionStorage.setItem("nc-audio-tip", "1");
      } catch (e) {
        /* 忽略 */
      }
    };

    // 没开过声音的人，第一次进站给一个提示气泡 + 按钮呼吸
    var tipSeen = false;
    try {
      tipSeen = sessionStorage.getItem("nc-audio-tip") === "1";
    } catch (e) {
      /* 忽略 */
    }
    if (!wantedOn) {
      audioBtn.classList.add("is-nudge");
      if (!tipSeen) {
        setTimeout(function () {
          audioTip.classList.add("is-show");
        }, 1600);
        setTimeout(hideTip, 9500);
      }
    }

    var paintAudio = function (on) {
      audioBtn.classList.toggle("is-on", on);
      audioBtn.setAttribute("aria-pressed", on ? "true" : "false");
      audioBtn.setAttribute("aria-label", on ? "关闭背景音乐" : "开启背景音乐");
      audioBtn.title = on ? "关闭背景音乐" : "开启背景音乐";
    };

    var fadeTo = function (target) {
      var timer = setInterval(function () {
        var v = bgm.volume;
        if (Math.abs(v - target) <= 0.03) {
          bgm.volume = target;
          clearInterval(timer);
          return;
        }
        bgm.volume = Math.max(0, Math.min(1, v + (target > v ? 0.05 : -0.05)));
      }, 40);
    };

    var startBgm = function () {
      var p = bgm.play();
      if (p && p.then) {
        p.then(function () {
          fadeTo(0.35);
          paintAudio(true);
        }).catch(function () {
          paintAudio(false);
        });
      } else {
        fadeTo(0.35);
        paintAudio(true);
      }
    };

    var stopBgm = function () {
      fadeTo(0);
      setTimeout(function () {
        bgm.pause();
      }, 380);
      paintAudio(false);
    };

    audioBtn.addEventListener("click", function () {
      audioBtn.classList.remove("is-nudge");
      hideTip();
      // 上一页开着音乐，但这一页被自动播放策略拦住：这次点击直接续播
      if (blocked) {
        blocked = false;
        startBgm();
        return;
      }
      wantedOn = !wantedOn;
      try {
        localStorage.setItem(STORE_ON, wantedOn ? "1" : "0");
      } catch (e) {
        /* 忽略 */
      }
      if (wantedOn) startBgm();
      else stopBgm();
    });

    bgm.addEventListener("loadedmetadata", function () {
      if (resumeAt > 0 && resumeAt < bgm.duration - 2) {
        try {
          bgm.currentTime = resumeAt;
        } catch (e) {
          /* 忽略 */
        }
      }
    });

    bgm.addEventListener("timeupdate", function () {
      if (Math.abs(bgm.currentTime - lastSave) > 2) {
        lastSave = bgm.currentTime;
        try {
          localStorage.setItem(STORE_T, String(Math.floor(bgm.currentTime)));
        } catch (e) {
          /* 忽略 */
        }
      }
    });

    window.addEventListener("pagehide", function () {
      try {
        localStorage.setItem(STORE_T, String(Math.floor(bgm.currentTime)));
      } catch (e) {
        /* 忽略 */
      }
    });

    if (wantedOn) {
      paintAudio(true);
      var resumed = bgm.play();
      if (resumed && resumed.then) {
        resumed.then(function () {
          fadeTo(0.35);
        }).catch(function () {
          // 浏览器拦截了自动播放：保持开启状态，等用户点一下再续播
          blocked = true;
          audioBtn.title = "点击继续播放背景音乐";
        });
      }
    }

    // CC BY 4.0 署名
    document.querySelectorAll(".foot-meta").forEach(function (el) {
      var credit = document.createElement("div");
      credit.className = "audio-credit";
      credit.innerHTML =
        'BGM <a href="https://incompetech.com" target="_blank" rel="noopener">Kevin MacLeod</a>' +
        " · “Neon Laser Horizon” · " +
        '<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>';
      el.appendChild(credit);
    });
  }

  // 动画页全屏封面：图片加载成功后显示，约 3 秒后淡出；没有图就完全不挡路
  var coverIntro = document.getElementById("coverIntro");
  if (coverIntro) {
    var coverSeen = false;
    try {
      coverSeen = sessionStorage.getItem("nc-anime-cover") === "1";
    } catch (e) {
      /* 忽略 */
    }

    var coverImg = coverIntro.querySelector("img");
    if (coverSeen || reduce || !coverImg) {
      coverIntro.parentNode.removeChild(coverIntro);
    } else {
      var coverClosed = false;
      var closeCover = function () {
        if (coverClosed) return;
        coverClosed = true;
        coverIntro.classList.add("is-out");
        document.documentElement.classList.remove("intro-locked");
        try {
          sessionStorage.setItem("nc-anime-cover", "1");
        } catch (e) {
          /* 忽略 */
        }
        setTimeout(function () {
          if (coverIntro.parentNode) coverIntro.parentNode.removeChild(coverIntro);
        }, 850);
      };

      var openCover = function () {
        coverIntro.classList.add("is-on");
        document.documentElement.classList.add("intro-locked");
        setTimeout(closeCover, 1000);
      };

      if (coverImg.complete && coverImg.naturalWidth) {
        openCover();
      } else {
        coverImg.addEventListener("load", openCover, { once: true });
      }
      coverImg.addEventListener("error", closeCover, { once: true });

      var coverSkip = coverIntro.querySelector(".ci-skip");
      if (coverSkip) coverSkip.addEventListener("click", closeCover);
      coverIntro.addEventListener("click", closeCover);

      // 兜底：3 秒还没显示出来就直接放行
      setTimeout(function () {
        if (!coverClosed && !coverIntro.classList.contains("is-on")) closeCover();
      }, 3000);
    }
  }

  // 全站循环扫描线（HUD 动态感）
  if (!reduce) {
    var scan = document.createElement("div");
    scan.className = "scanline";
    scan.setAttribute("aria-hidden", "true");
    document.body.insertBefore(scan, document.body.firstChild);
  }
})();
