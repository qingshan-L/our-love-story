/**
 * Our Love Story · 交互逻辑
 * 内容全部来自 data.js 的 SITE_CONFIG。
 */
(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const config = typeof SITE_CONFIG !== "undefined" ? SITE_CONFIG : {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let startDate = null;
  let countingDays = false;

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setText(selector, value) {
    const el = $(selector);
    if (el) el.textContent = value == null ? "" : String(value);
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function formatDate(date) {
    return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
  }

  /* ==========================================================
   * 首屏
   * ========================================================== */
  function renderHero() {
    const couple = config.couple || {};
    const hero = config.hero || {};

    setText("#brandText", couple.brandText || "我们的故事");
    setText("#nameA", couple.nameA);
    setText("#nameB", couple.nameB);
    setText("#heroEyebrow", hero.eyebrow);
    setText("#heroScript", hero.script);
    setText("#heroSubtitle", hero.subtitle);
    setText("#heroQuote", hero.quote);
    setText("#quoteBy", hero.quoteBy);
    setText("#daysLabel", hero.daysLabel);
    setText("#daysCaption", hero.daysCaption || "天");
    setText("#statCaption", hero.statCaption);
    setText("#countdownLabel", hero.countdownLabel);
    setText("#anniversaryLabel", hero.anniversaryLabel || "下一个纪念日");
    setText("#startDateLabel", startDate ? `自 ${formatDate(startDate)} 起` : "自 — 起");

    document.title = `我们的故事 · ${couple.nameA || "TA"} & ${couple.nameB || "我"}`;
  }

  /* ==========================================================
   * 天数 / 纪念日倒计时
   * ========================================================== */
  function parseDate(value) {
    if (!value) return null;
    const parts = String(value).split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return isNaN(date.getTime()) ? null : date;
  }

  function getDaysTogether(now) {
    if (!startDate) return 0;
    return Math.max(0, Math.floor((now - startDate) / 86400000));
  }

  function getNextAnniversary() {
    const fixed = parseDate((config.hero || {}).customAnniversary);
    const now = new Date();
    let year = now.getFullYear();
    let month, day;

    if (fixed) {
      month = fixed.getMonth();
      day = fixed.getDate();
    } else if (startDate) {
      month = startDate.getMonth();
      day = startDate.getDate();
    } else {
      return null;
    }

    const maxDay = new Date(year, month + 1, 0).getDate();
    let target = new Date(year, month, Math.min(day, maxDay));

    const endOfDay = new Date(target);
    endOfDay.setDate(endOfDay.getDate() + 1);
    if (now >= endOfDay) {
      year += 1;
      const nextMaxDay = new Date(year, month + 1, 0).getDate();
      target = new Date(year, month, Math.min(day, nextMaxDay));
    }

    const isToday =
      now.getFullYear() === target.getFullYear() &&
      now.getMonth() === target.getMonth() &&
      now.getDate() === target.getDate();

    if (isToday) {
      const nextYear = year + 1;
      const nextMaxDay = new Date(nextYear, month + 1, 0).getDate();
      target = new Date(nextYear, month, Math.min(day, nextMaxDay));
    }

    return { target, isToday };
  }

  function getCountdownParts(target, now) {
    let remaining = Math.max(0, target - now);
    const days = Math.floor(remaining / 86400000);
    remaining %= 86400000;
    const hours = Math.floor(remaining / 3600000);
    remaining %= 3600000;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return { days, hours, minutes, seconds };
  }

  function updateCountdown() {
    const now = new Date();
    if (!countingDays) setText("#daysTogether", getDaysTogether(now));

    const anniversary = getNextAnniversary();
    if (!anniversary) return;

    setText("#anniversaryDate", formatDate(anniversary.target));

    const { days, hours, minutes, seconds } = getCountdownParts(anniversary.target, now);

    setText("#cdDays", pad(days));
    setText("#cdHours", pad(hours));
    setText("#cdMinutes", pad(minutes));
    setText("#cdSeconds", pad(seconds));

    if (anniversary.isToday) {
      setText("#countdownLabel", "♥ 今天就是我们的纪念日 ♥");
      setText("#anniversaryLabel", "今天");
    }
  }

  /** 数字从 0 缓动到实际天数 */
  function animateDays() {
    const el = $("#daysTogether");
    const target = getDaysTogether(new Date());
    if (!el || reduceMotion || target <= 0) {
      if (el) el.textContent = target;
      return;
    }

    countingDays = true;
    const duration = 1050;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        countingDays = false;
        el.textContent = target;
      }
    }

    requestAnimationFrame(frame);
  }

  /* ==========================================================
   * 时间轴
   * ========================================================== */
  function renderTimeline() {
    const timeline = config.timeline || {};
    setText("#timelineKicker", timeline.kicker);
    setText("#timelineTitle", timeline.title);
    setText("#timelineDesc", timeline.desc);
    setText("#timelineEnding", timeline.ending);

    const list = $("#timelineList");
    if (!list || !Array.isArray(timeline.events)) return;

    list.innerHTML = timeline.events
      .map((event, index) => {
        const delay = (index % 3) * 70;
        const highlight = event.highlight ? " is-highlight" : "";
        return `
        <article class="story-card reveal${highlight}" style="--delay: ${delay}ms">
          <div class="story-card-top">
            <span class="story-index">${pad(index + 1)}</span>
            ${event.tag ? `<span class="story-tag">${escapeHTML(event.tag)}</span>` : ""}
          </div>
          <time class="story-date">${escapeHTML(event.date)}</time>
          <h3>${escapeHTML(event.title)}</h3>
          <p>${escapeHTML(event.desc)}</p>
        </article>`;
      })
      .join("");
  }

  /* ==========================================================
   * 里程碑
   * ========================================================== */
  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function addMonths(date, months) {
    const base = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const maxDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    base.setDate(Math.min(date.getDate(), maxDay));
    return base;
  }

  function getMilestones(now) {
    const items = (config.milestones || {}).items || [];
    if (!startDate || !Array.isArray(items) || !items.length) return [];

    const today = startOfDay(now || new Date());
    const origin = startOfDay(startDate);

    return items
      .map((item) => {
        const value = Number(item.value) || 0;
        let target = null;

        if (item.type === "days") target = addDays(origin, value);
        else if (item.type === "months") target = addMonths(origin, value);
        else if (item.type === "years") target = addMonths(origin, value * 12);

        if (!target) return null;
        target = startOfDay(target);

        const totalDays = Math.max(1, Math.round((target - origin) / 86400000));
        const elapsedDays = Math.max(
          0,
          Math.min(totalDays, Math.round((today - origin) / 86400000))
        );
        const achieved = today >= target;
        const remaining = achieved
          ? 0
          : Math.max(0, Math.ceil((target - today) / 86400000));

        return {
          label: item.label || `${value} 天`,
          target,
          achieved,
          remaining,
          progress: achieved ? 1 : Math.min(1, elapsedDays / totalDays),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.target - b.target);
  }

  function renderMilestones() {
    const milestonesConfig = config.milestones || {};
    setText("#milestoneKicker", milestonesConfig.kicker);
    setText("#milestoneTitle", milestonesConfig.title);
    setText("#milestoneDesc", milestonesConfig.desc);

    const share = milestonesConfig.share || {};
    setText("#shareKicker", share.kicker);
    setText("#shareTitle", share.title);
    setText("#shareDesc", share.desc);
    if (share.copyLabel) setText("#copyLabel", share.copyLabel);
    if (share.downloadLabel) setText("#downloadLabel", share.downloadLabel);

    const grid = $("#milestoneGrid");
    const nextBox = $("#milestoneNext");
    if (!grid || !nextBox) return;

    const milestones = getMilestones();
    if (!milestones.length) {
      grid.innerHTML = "";
      nextBox.innerHTML =
        '<p class="milestone-next-note">填写起始日期后，这里会自动计算你们的里程碑。</p>';
      return;
    }

    const doneCount = milestones.filter((item) => item.achieved).length;
    const next = milestones.find((item) => !item.achieved);

    if (!next) {
      nextBox.innerHTML = `
        <div class="milestone-next-head">
          <div>
            <span class="micro-label">里程碑进度</span>
            <p class="milestone-next-name">全部解锁 🎉</p>
          </div>
          <span class="milestone-next-days">${doneCount} / ${milestones.length}</span>
        </div>
        <div class="milestone-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100">
          <span style="width: 100%"></span>
        </div>
        <p class="milestone-next-note">每一个节点都已抵达，故事继续向前。</p>`;
    } else {
      const percent = Math.round(next.progress * 100);
      const remainingText = next.remaining > 0 ? `还有 ${next.remaining} 天` : "今天达成";
      nextBox.innerHTML = `
        <div class="milestone-next-head">
          <div>
            <span class="micro-label">下一个里程碑</span>
            <p class="milestone-next-name">${escapeHTML(next.label)}</p>
          </div>
          <span class="milestone-next-days">${remainingText}</span>
        </div>
        <div class="milestone-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-label="距离下一个里程碑的进度">
          <span style="width: ${percent}%"></span>
        </div>
        <p class="milestone-next-note">已解锁 ${doneCount} / ${milestones.length} 个里程碑 · 目标日期 ${formatDate(next.target)}</p>`;
    }

    grid.innerHTML = milestones
      .map((item, index) => {
        const classes = ["milestone-card", "reveal"];
        if (item.achieved) classes.push("is-done");
        if (item === next) classes.push("is-next");

        const state = item.achieved
          ? "已达成"
          : item.remaining > 0
            ? `还有 ${item.remaining} 天`
            : "今天达成";
        const date = item.achieved
          ? `达成于 ${formatDate(item.target)}`
          : `目标 ${formatDate(item.target)}`;

        return `
        <article class="${classes.join(" ")}" style="--delay: ${(index % 3) * 60}ms">
          <div class="milestone-top">
            <span class="milestone-icon" aria-hidden="true">${item.achieved ? "♥" : "♡"}</span>
            <span class="milestone-state">${state}</span>
          </div>
          <h3 class="milestone-name">${escapeHTML(item.label)}</h3>
          <p class="milestone-date">${date}</p>
        </article>`;
      })
      .join("");
  }

  /* ==========================================================
   * 复制总结 / 下载纪念卡片
   * ========================================================== */
  let feedbackTimer = null;
  let copyResetTimer = null;
  let downloadResetTimer = null;

  function showFeedback(message, type) {
    const el = $("#actionFeedback");
    if (!el) return;

    el.textContent = message;
    el.classList.remove("is-success", "is-error");
    el.classList.add("is-visible", type === "error" ? "is-error" : "is-success");

    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      el.classList.remove("is-visible", "is-success", "is-error");
    }, 3200);
  }

  function buildSummaryText() {
    const couple = config.couple || {};
    const footer = config.footer || {};
    const now = new Date();
    const days = getDaysTogether(now);
    const anniversary = getNextAnniversary();
    const milestones = getMilestones(now);
    const doneCount = milestones.filter((item) => item.achieved).length;
    const next = milestones.find((item) => !item.achieved);
    const lines = [];

    lines.push("💗 我们的爱情总结 💗");
    lines.push("━━━━━━━━━━━━━━");
    lines.push(`💑 ${couple.nameA || "TA"} & ${couple.nameB || "我"}`);
    if (startDate) lines.push(`📅 始于 ${formatDate(startDate)}`);
    lines.push(`💞 在一起 ${days} 天`);

    if (anniversary) {
      const countdown = getCountdownParts(anniversary.target, now);
      lines.push(
        `⏳ 距 ${formatDate(anniversary.target)} 纪念日还有 ${countdown.days} 天 ${pad(
          countdown.hours
        )} 时 ${pad(countdown.minutes)} 分`
      );
    }

    if (milestones.length) {
      lines.push(`🏅 已解锁里程碑 ${doneCount} / ${milestones.length}`);
      if (next) {
        const remainingText = next.remaining > 0 ? `还有 ${next.remaining} 天` : "今天达成";
        lines.push(`🎯 下一个：${next.label}，${remainingText}`);
      } else {
        lines.push("🎯 所有里程碑都已解锁");
      }
    }

    lines.push("━━━━━━━━━━━━━━");
    if (footer.sub) lines.push(footer.sub);

    return lines.join("\n");
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return legacyCopy(text);
  }

  function legacyCopy(text) {
    return new Promise((resolve, reject) => {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "-9999px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, area.value.length);

      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }

      document.body.removeChild(area);
      if (copied) resolve();
      else reject(new Error("copy failed"));
    });
  }

  function roundRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function drawGlow(ctx, x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24);
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-2, 4, -12, 0, -12, -7);
    ctx.bezierCurveTo(-12, -14, -3, -16, 0, -9);
    ctx.bezierCurveTo(3, -16, 12, -14, 12, -7);
    ctx.bezierCurveTo(12, 0, 2, 4, 0, 8);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function setCanvasFont(ctx, font, spacing) {
    ctx.font = font;
    if ("letterSpacing" in ctx) ctx.letterSpacing = spacing || "0px";
  }

  function drawShareCard() {
    const couple = config.couple || {};
    const footer = config.footer || {};
    const now = new Date();
    const days = getDaysTogether(now);
    const anniversary = getNextAnniversary();
    const countdown = anniversary ? getCountdownParts(anniversary.target, now) : null;
    const milestones = getMilestones(now);
    const doneCount = milestones.filter((item) => item.achieved).length;
    const nextMilestone = milestones.find((item) => !item.achieved);

    const W = 1080;
    const H = 1350;
    const SANS =
      '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif';
    const SERIF = 'Georgia, "Songti SC", "STSong", serif';
    const INK = "#3d2833";
    const MUTED = "#8b6f7a";
    const ACCENT = "#e8577d";

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    // 背景渐变
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#ffe9f2");
    bg.addColorStop(0.55, "#ffdceb");
    bg.addColorStop(1, "#ffe4d9");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawGlow(ctx, 110, 70, 440, "rgba(255, 111, 145, 0.30)");
    drawGlow(ctx, W - 80, 300, 420, "rgba(255, 190, 150, 0.34)");
    drawGlow(ctx, W / 2, H - 40, 540, "rgba(216, 160, 222, 0.26)");

    // 白色玻璃卡片
    const cardPad = 68;
    const cardW = W - cardPad * 2;
    const cardH = H - cardPad * 2;

    ctx.save();
    ctx.shadowColor = "rgba(190, 95, 125, 0.20)";
    ctx.shadowBlur = 70;
    ctx.shadowOffsetY = 26;
    roundRectPath(ctx, cardPad, cardPad, cardW, cardH, 48);
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRectPath(ctx, cardPad, cardPad, cardW, cardH, 48);
    ctx.clip();
    drawGlow(ctx, W - 190, 190, 300, "rgba(255, 143, 168, 0.22)");
    drawGlow(ctx, 210, H - 220, 300, "rgba(255, 190, 150, 0.20)");
    ctx.restore();

    roundRectPath(ctx, cardPad, cardPad, cardW, cardH, 48);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const center = W / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    // 眉题
    ctx.fillStyle = ACCENT;
    setCanvasFont(ctx, `500 30px ${SANS}`, "6px");
    ctx.fillText(`始于 ${startDate ? formatDate(startDate) : "—"} · 我们的故事`, center, 205);
    setCanvasFont(ctx, `500 30px ${SANS}`, "0px");

    // 名字
    const nameA = couple.nameA || "TA";
    const nameB = couple.nameB || "我";
    const nameFont = `600 92px ${SANS}`;
    const ampFont = `italic 600 78px ${SERIF}`;

    ctx.font = nameFont;
    const widthA = ctx.measureText(nameA).width;
    const widthB = ctx.measureText(nameB).width;
    ctx.font = ampFont;
    const widthAmp = ctx.measureText("&").width;

    const gap = 26;
    const totalWidth = widthA + widthB + widthAmp + gap * 2;
    let nameX = center - totalWidth / 2;

    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = nameFont;
    ctx.fillText(nameA, nameX, 332);
    nameX += widthA + gap;

    ctx.fillStyle = "#ff6f91";
    ctx.font = ampFont;
    ctx.fillText("&", nameX, 328);
    nameX += widthAmp + gap;

    ctx.fillStyle = INK;
    ctx.font = nameFont;
    ctx.fillText(nameB, nameX, 332);
    ctx.textAlign = "center";

    // 装饰文案
    ctx.fillStyle = ACCENT;
    ctx.font = `italic 500 38px ${SERIF}`;
    ctx.fillText("我们的小宇宙", center, 402);

    // 天数
    ctx.fillStyle = MUTED;
    setCanvasFont(ctx, `500 28px ${SANS}`, "8px");
    ctx.fillText("在一起", center, 508);
    setCanvasFont(ctx, `500 28px ${SANS}`, "0px");

    const numberText = String(days);
    const numberFont = `400 200px ${SERIF}`;
    const unitFont = `400 46px ${SANS}`;

    ctx.font = numberFont;
    const numberWidth = ctx.measureText(numberText).width;
    ctx.font = unitFont;
    const unitWidth = ctx.measureText("天").width;

    const numberGap = 18;
    const numberStart = center - (numberWidth + unitWidth + numberGap) / 2;

    ctx.textAlign = "left";
    ctx.font = numberFont;
    const numberGradient = ctx.createLinearGradient(
      numberStart,
      0,
      numberStart + numberWidth,
      0
    );
    numberGradient.addColorStop(0, INK);
    numberGradient.addColorStop(1, ACCENT);
    ctx.fillStyle = numberGradient;
    ctx.fillText(numberText, numberStart, 706);

    ctx.font = unitFont;
    ctx.fillStyle = ACCENT;
    ctx.fillText("天", numberStart + numberWidth + numberGap, 706);
    ctx.textAlign = "center";

    ctx.fillStyle = MUTED;
    ctx.font = `400 30px ${SANS}`;
    ctx.fillText("我们已经一起走过", center, 772);

    // 分隔线
    ctx.strokeStyle = "rgba(232, 87, 125, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 826);
    ctx.lineTo(W - 180, 826);
    ctx.stroke();

    // 两栏数据
    const colLeft = 350;
    const colRight = W - 350;

    ctx.fillStyle = MUTED;
    ctx.font = `500 26px ${SANS}`;
    ctx.fillText("下一个纪念日", colLeft, 892);
    ctx.fillText("纪念日倒计时", colRight, 892);

    ctx.fillStyle = INK;
    ctx.font = `600 42px ${SANS}`;
    ctx.fillText(anniversary ? formatDate(anniversary.target) : "—", colLeft, 948);

    ctx.fillStyle = ACCENT;
    ctx.fillText(
      countdown ? `${countdown.days} 天 ${pad(countdown.hours)} 时` : "—",
      colRight,
      948
    );

    ctx.strokeStyle = "rgba(232, 87, 125, 0.16)";
    ctx.beginPath();
    ctx.moveTo(center, 868);
    ctx.lineTo(center, 962);
    ctx.stroke();

    // 里程碑
    if (milestones.length) {
      ctx.fillStyle = INK;
      ctx.font = `500 32px ${SANS}`;
      ctx.fillText(`已解锁里程碑 ${doneCount} / ${milestones.length}`, center, 1052);

      ctx.fillStyle = ACCENT;
      ctx.font = `500 28px ${SANS}`;
      if (nextMilestone) {
        const remainingText =
          nextMilestone.remaining > 0 ? `还有 ${nextMilestone.remaining} 天` : "今天达成";
        ctx.fillText(
          `下一个 · ${nextMilestone.label} · ${remainingText}`,
          center,
          1102
        );
      } else {
        ctx.fillText("所有里程碑都已解锁", center, 1102);
      }
    }

    // 落款
    if (footer.sub) {
      ctx.fillStyle = ACCENT;
      ctx.font = `italic 400 32px ${SERIF}`;
      ctx.fillText(footer.sub, center, 1208, 780);
    }

    drawHeart(ctx, center, 1252, 22, "#ff8fa8");

    return canvas;
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function setupShareActions() {
    const copyBtn = $("#copyBtn");
    const downloadBtn = $("#downloadBtn");

    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        if (copyBtn.disabled) return;
        const label = $("#copyLabel");
        const original = label.textContent;

        copyBtn.disabled = true;
        copyToClipboard(buildSummaryText())
          .then(() => {
            label.textContent = "已复制 ✓";
            copyBtn.classList.add("is-success");
            showFeedback("已复制到剪贴板，直接粘贴到聊天窗口即可。", "success");
          })
          .catch(() => {
            label.textContent = "复制失败";
            showFeedback("复制失败，请检查浏览器权限后重试。", "error");
          })
          .finally(() => {
            clearTimeout(copyResetTimer);
            copyResetTimer = setTimeout(() => {
              label.textContent = original;
              copyBtn.classList.remove("is-success");
              copyBtn.disabled = false;
            }, 2200);
          });
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        if (downloadBtn.disabled) return;
        const label = $("#downloadLabel");
        const original = label.textContent;
        const now = new Date();
        const filename = `our-story-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
          now.getDate()
        )}.png`;

        const resetButton = (delay) => {
          clearTimeout(downloadResetTimer);
          downloadResetTimer = setTimeout(() => {
            label.textContent = original;
            downloadBtn.classList.remove("is-success");
            downloadBtn.disabled = false;
          }, delay);
        };

        downloadBtn.disabled = true;
        label.textContent = "正在生成…";

        try {
          const canvas = drawShareCard();
          const finish = () => {
            label.textContent = "已开始下载 ✓";
            downloadBtn.classList.add("is-success");
            showFeedback("纪念卡片已生成，PNG 图片正在下载。", "success");
            resetButton(2400);
          };

          if (canvas.toBlob) {
            canvas.toBlob((blob) => {
              if (!blob) {
                label.textContent = "生成失败";
                showFeedback("图片生成失败，请稍后重试。", "error");
                resetButton(2000);
                return;
              }
              triggerDownload(blob, filename);
              finish();
            }, "image/png");
          } else {
            const link = document.createElement("a");
            link.href = canvas.toDataURL("image/png");
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            finish();
          }
        } catch (error) {
          console.error("生成纪念卡片失败：", error);
          label.textContent = "生成失败";
          showFeedback("图片生成失败，请稍后重试。", "error");
          resetButton(2000);
        }
      });
    }
  }

  /* ==========================================================
   * 相册 + 灯箱（暂时隐藏，保留备用）
   * ========================================================== */
  let photos = [];
  let currentPhoto = 0;
  let lastFocusedElement = null;

  function renderAlbum() {
    const album = config.album || {};
    setText("#albumKicker", album.kicker);
    setText("#albumTitle", album.title);
    setText("#albumDesc", album.desc);
    setText("#albumHint", album.hint);

    photos = Array.isArray(album.photos) ? album.photos : [];
    const grid = $("#albumGrid");
    if (!grid) return;

    grid.innerHTML = photos
      .map(
        (photo, index) => `
        <button class="album-card reveal" type="button" data-index="${index}"
                style="--delay: ${(index % 3) * 70}ms"
                aria-label="查看照片：${escapeHTML(photo.caption || `照片 ${index + 1}`)}">
          <span class="album-image-wrap">
            <img src="${escapeHTML(photo.src)}" alt="${escapeHTML(photo.caption || "我们的照片")}" loading="lazy" />
            <span class="album-overlay" aria-hidden="true"><span class="album-zoom">＋</span></span>
          </span>
          <span class="album-caption">${escapeHTML(photo.caption || "")}</span>
        </button>`
      )
      .join("");

    grid.querySelectorAll(".album-card").forEach((card) => {
      card.addEventListener("click", () => openLightbox(Number(card.dataset.index)));
    });
  }

  function showPhoto(index) {
    if (!photos.length) return;
    currentPhoto = (index + photos.length) % photos.length;
    const photo = photos[currentPhoto];
    const image = $("#lightboxImage");

    image.classList.add("is-loading");
    image.onload = () => image.classList.remove("is-loading");
    image.onerror = () => {
      image.classList.remove("is-loading");
      image.alt = "图片加载失败";
    };
    image.src = photo.src;
    image.alt = photo.caption || "我们的照片";

    setText("#lightboxCaption", photo.caption);
    setText("#lightboxCounter", `${currentPhoto + 1} / ${photos.length}`);
  }

  function openLightbox(index) {
    const lightbox = $("#lightbox");
    if (!lightbox || !photos.length) return;
    lastFocusedElement = document.activeElement;
    lightbox.hidden = false;
    document.body.classList.add("no-scroll");
    showPhoto(index);
    $("#lightboxClose").focus();
  }

  function closeLightbox() {
    const lightbox = $("#lightbox");
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function setupLightbox() {
    $("#lightboxClose").addEventListener("click", closeLightbox);
    $("#lightboxPrev").addEventListener("click", () => showPhoto(currentPhoto - 1));
    $("#lightboxNext").addEventListener("click", () => showPhoto(currentPhoto + 1));

    $("#lightbox").addEventListener("click", (event) => {
      if (event.target === $("#lightbox")) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      const lightbox = $("#lightbox");
      if (!lightbox || lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
      if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
    });
  }

  /* ==========================================================
   * 轻量交互
   * ========================================================== */
  function setupScrollUI() {
    const header = $("#siteHeader");
    const progress = $("#scrollProgress");
    const toTop = $("#toTop");
    const links = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main section[id]:not([hidden])");

    const onScroll = () => {
      const scrollY = window.scrollY;
      header.classList.toggle("is-scrolled", scrollY > 24);
      if (toTop) toTop.classList.toggle("is-visible", scrollY > 480);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, scrollY / max) : 0;
      progress.style.transform = `scaleX(${ratio})`;

      let activeId = "home";
      sections.forEach((section) => {
        if (scrollY >= section.offsetTop - window.innerHeight * 0.4) {
          activeId = section.id;
        }
      });
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  function setupBackToTop() {
    const button = $("#toTop");
    if (!button) return;

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /** 鼠标移动时，首屏浮现一层柔和光晕 */
  function setupCursorGlow() {
    const hero = $(".hero");
    if (!hero || reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty("--px", `${event.clientX - rect.left}px`);
      hero.style.setProperty("--py", `${event.clientY - rect.top}px`);
    });
  }

  function observeReveals() {
    const items = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );

    items.forEach((item) => observer.observe(item));
  }

  /* ==========================================================
   * 启动
   * ========================================================== */
  function init() {
    startDate = parseDate((config.couple || {}).startDate);

    renderHero();
    renderTimeline();
    renderMilestones();
    renderAlbum();

    updateCountdown();
    animateDays();
    setInterval(updateCountdown, 1000);

    setupLightbox();
    setupScrollUI();
    setupBackToTop();
    setupShareActions();
    setupCursorGlow();

    setText("#footerLine", (config.footer || {}).line);
    setText("#footerSub", (config.footer || {}).sub);

    observeReveals();

    // 动态内容渲染后重新对齐锚点，避免布局变化让深链接落点偏移
    const hashId = window.location.hash ? window.location.hash.slice(1) : "";
    const anchor = hashId ? document.getElementById(hashId) : null;
    if (anchor) {
      requestAnimationFrame(() => anchor.scrollIntoView({ block: "start" }));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
