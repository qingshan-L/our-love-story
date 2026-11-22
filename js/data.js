/**
 * ============================================================
 *  网站内容配置文件
 *  ------------------------------------------------------------
 *  只修改这个文件里的文字 / 日期 / 图片路径，页面会自动更新。
 * ============================================================
 */
const SITE_CONFIG = {
  // ---------- 主角信息 ----------
  couple: {
    nameA: "小余",
    nameB: "小周",
    startDate: "2021-05-20",       // 格式：YYYY-MM-DD
    brandText: "我们的故事",
  },

  // ---------- 首屏 ----------
  hero: {
    eyebrow: "始于 2021 · 我们的故事",
    script: "我们的小宇宙", // 名字下方的装饰文案
    subtitle: "从相遇的那天起，平凡的日子都有了坐标。这里是属于我们两个人的小宇宙。",
    quote: "喜欢是乍见之欢，爱是久处不厌。",
    quoteBy: "—— 写给我们",
    daysLabel: "在一起的日子",
    daysCaption: "天",
    statCaption: "我们已经一起走过",
    countdownLabel: "距离下一个纪念日",
    anniversaryLabel: "下一个纪念日",
    // 指定固定纪念日如 "2027-01-01"；留空则按 startDate 的月/日每年计算
    customAnniversary: "",
  },

  // ---------- 时间轴 ----------
  timeline: {
    kicker: "01 / 时光轴",
    title: "每个瞬间，都关于你",
    desc: "时间不说话，却替我们记住了所有重要的时刻。",
    ending: "故事还在继续，下一页留给我们一起写。",
    events: [
      {
        date: "2021.05.20",
        title: "故事的开始",
        desc: "那天阳光很好，你笑着说：『要不要在一起试试？』于是，一切都开始了。",
        tag: "相遇",
      },
      {
        date: "2021.08.14",
        title: "第一次约会",
        desc: "街角那家小店，两杯热拿铁，聊到打烊。原来话投机真的可以忘记时间。",
        tag: "约会",
      },
      {
        date: "2022.02.14",
        title: "第一个情人节",
        desc: "收到花的那一刻才明白，浪漫不是花本身，而是记得你喜欢花的那个人。",
        tag: "节日",
      },
      {
        date: "2023.05.20",
        title: "两周年纪念",
        desc: "一起做了蛋糕，虽然没有想象中完美，但每一口都是甜的味道。",
        tag: "纪念",
      },
      {
        date: "2024.10.01",
        title: "我们的小家",
        desc: "有了第一个共同的小窝，从此万家灯火中，有一盏是为我们而亮。",
        tag: "生活",
      },
      {
        date: "现在",
        title: "未完待续",
        desc: "故事还在继续，下一个章节，等你和我一起写。",
        tag: "未来",
        highlight: true,
      },
    ],
  },

  // ---------- 里程碑 ----------
  // type 支持 "days"（天）、"months"（月）、"years"（年）
  milestones: {
    kicker: "03 / 里程碑",
    title: "一起解锁的纪念",
    desc: "从第一个 100 天开始，每个节点都值得被记住。",
    items: [
      { label: "100 天", type: "days", value: 100 },
      { label: "6 个月", type: "months", value: 6 },
      { label: "1 年", type: "years", value: 1 },
      { label: "2 年", type: "years", value: 2 },
      { label: "1000 天", type: "days", value: 1000 },
      { label: "3 年", type: "years", value: 3 },
      { label: "5 年", type: "years", value: 5 },
      { label: "2000 天", type: "days", value: 2000 },
      { label: "3000 天", type: "days", value: 3000 },
    ],
    share: {
      kicker: "分享这份心动",
      title: "把我们的故事带在身边",
      desc: "复制一段排版好的文字，或生成一张纪念卡片图片。",
      copyLabel: "复制爱情总结",
      downloadLabel: "下载纪念卡片",
    },
  },

  // ---------- 相册（暂时隐藏，以后备用） ----------
  // 展示时：去掉 index.html 中相册 <section> 的 hidden 属性，并恢复导航「相册」链接。
  // 把 src 换成真实照片路径即可，例如 "assets/images/our-photo-1.jpg"
  album: {
    kicker: "04 / 相册",
    title: "把美好都收藏起来",
    desc: "每一张照片，都是时光写给我们的情书。",
    hint: "点击照片可放大查看，左右方向键切换",
    photos: [
      { src: "assets/images/photo-1.svg", caption: "初见 · 那个心动的瞬间" },
      { src: "assets/images/photo-2.svg", caption: "第一次一起看海" },
      { src: "assets/images/photo-3.svg", caption: "生日那天的烛光" },
      { src: "assets/images/photo-4.svg", caption: "我们的日常小确幸" },
      { src: "assets/images/photo-5.svg", caption: "旅行路上的风景" },
      { src: "assets/images/photo-6.svg", caption: "要一直一直在一起" },
    ],
  },

  // ---------- 页脚 ----------
  footer: {
    line: "小余 & 小周 · 2021 — ∞",
    sub: "愿每一次回头，都能看见你还在。",
  },
};
