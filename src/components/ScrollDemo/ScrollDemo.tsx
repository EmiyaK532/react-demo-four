import { useState, useEffect, useRef } from "react";
import "./ScrollDemo.css";

/**
 * 基于滚动条的演示组件
 * 展示多种滚动相关的交互和效果
 */
const ScrollDemo = () => {
  // 进度条状态
  const [scrollProgress, setScrollProgress] = useState(0);
  // 滚动位置
  const [scrollPosition, setScrollPosition] = useState(0);
  // 是否显示回到顶部按钮
  const [showBackToTop, setShowBackToTop] = useState(false);
  // 滚动方向
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  // 上一次滚动位置
  const lastScrollTop = useRef(0);
  // 导航栏状态
  const [navbarVisible, setNavbarVisible] = useState(true);
  // 懒加载图片
  const [imagesLoaded, setImagesLoaded] = useState(0);
  // 视差元素引用
  const parallaxRef = useRef<HTMLDivElement>(null);
  // 内容区域引用 - 用于滚动事件
  const contentRef = useRef<HTMLDivElement>(null);
  // 内容块引用 - 用于视图中检测
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  // 记录可见的内容块
  const [visibleSections, setVisibleSections] = useState<number[]>([]);

  /**
   * 图片数据 - 模拟懒加载用
   */
  const images = [
    { id: 1, src: "https://picsum.photos/id/10/800/400", title: "风景图片 1" },
    { id: 2, src: "https://picsum.photos/id/11/800/400", title: "风景图片 2" },
    { id: 3, src: "https://picsum.photos/id/12/800/400", title: "风景图片 3" },
    { id: 4, src: "https://picsum.photos/id/13/800/400", title: "风景图片 4" },
    { id: 5, src: "https://picsum.photos/id/14/800/400", title: "风景图片 5" },
    { id: 6, src: "https://picsum.photos/id/15/800/400", title: "风景图片 6" },
  ];

  /**
   * 处理滚动事件
   * 更新滚动位置、方向和进度
   */
  const handleScroll = () => {
    if (!contentRef.current) return;

    const scrollContainer = contentRef.current;
    // 获取当前滚动位置
    const scrollTop = scrollContainer.scrollTop;
    // 计算滚动进度
    const scrollHeight =
      scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;

    // 更新状态
    setScrollPosition(scrollTop);
    setScrollProgress(progress);

    // 显示/隐藏回到顶部按钮
    setShowBackToTop(scrollTop > 300);

    // 检测滚动方向
    if (scrollTop > lastScrollTop.current) {
      setScrollDirection("down");
      // 向下滚动超过100px时隐藏导航栏
      if (scrollTop > 100) {
        setNavbarVisible(false);
      }
    } else {
      setScrollDirection("up");
      // 向上滚动时显示导航栏
      setNavbarVisible(true);
    }

    // 更新上一次滚动位置
    lastScrollTop.current = scrollTop;

    // 更新视差效果
    updateParallax(scrollTop);

    // 检查哪些内容块在视图中
    checkVisibleSections();
  };

  /**
   * 更新视差效果
   * @param scrollTop 当前滚动位置
   */
  const updateParallax = (scrollTop: number) => {
    if (!parallaxRef.current) return;

    // 视差滚动效果 - 背景以较慢的速度滚动
    const offset = scrollTop * 0.5; // 滚动速度的一半
    parallaxRef.current.style.transform = `translateY(${offset}px)`;
  };

  /**
   * 检查哪些内容块在视图中
   */
  const checkVisibleSections = () => {
    if (!contentRef.current) return;

    const visible: number[] = [];

    sectionRefs.current.forEach((section, index) => {
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const containerRect = contentRef.current!.getBoundingClientRect();

      // 检查内容块是否在视图中
      // 如果内容块顶部在视图中，或者底部在视图中，或者内容块完全覆盖视图
      if (
        (rect.top >= containerRect.top && rect.top <= containerRect.bottom) ||
        (rect.bottom >= containerRect.top &&
          rect.bottom <= containerRect.bottom) ||
        (rect.top <= containerRect.top && rect.bottom >= containerRect.bottom)
      ) {
        visible.push(index);
      }
    });

    setVisibleSections(visible);
  };

  /**
   * 滚动到页面顶部
   */
  const scrollToTop = () => {
    if (!contentRef.current) return;

    // 使用平滑滚动效果
    contentRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /**
   * 滚动到指定内容块
   * @param index 内容块索引
   */
  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index];
    if (!section || !contentRef.current) return;

    contentRef.current.scrollTo({
      top: section.offsetTop - 20, // 留出一点空间
      behavior: "smooth",
    });
  };

  /**
   * 模拟图片懒加载
   */
  const handleImageLoad = () => {
    setImagesLoaded((prev) => prev + 1);
  };

  /**
   * 初始化滚动事件监听
   */
  useEffect(() => {
    const scrollElement = contentRef.current;
    if (!scrollElement) return;

    // 监听滚动事件
    scrollElement.addEventListener("scroll", handleScroll);

    // 清理函数
    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /**
   * 创建内容块引用
   */
  useEffect(() => {
    // 为每个内容块创建引用
    sectionRefs.current = Array(5).fill(null);
  }, []);

  // 创建 ref 回调函数
  const setSectionRef = (index: number) => (el: HTMLElement | null) => {
    sectionRefs.current[index] = el;
  };

  return (
    <div className="h-screen flex flex-col">
      <h1 className="text-2xl font-bold p-6">滚动条 Demo</h1>

      {/* 主内容区域 */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto relative scroll-container"
      >
        {/* 顶部视差背景 */}
        <div className="parallax-container h-80 overflow-hidden relative">
          <div
            ref={parallaxRef}
            className="parallax-bg"
            style={{
              backgroundImage: `url(https://picsum.photos/id/1029/1400/800)`,
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <h2 className="text-4xl font-bold text-center">滚动交互 Demo</h2>
          </div>
        </div>

        {/* 滚动指示箭头 */}
        <div className="scroll-arrow">
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* 内容区域 */}
        <div className="bg-white p-6">
          {/* 内容块 1 - 滚动进度 */}
          <section
            ref={setSectionRef(0)}
            className={`content-section mb-16 ${
              visibleSections.includes(0) ? "visible" : ""
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">1. 滚动进度指示器</h3>
            <p className="mb-4">
              页面顶部的进度条会随着页面的滚动而变化，直观地展示当前阅读进度。
              这种交互可以帮助用户了解内容的长度和当前位置，特别适合长文章或长页面。
            </p>
            <div className="p-4 bg-blue-50 rounded mb-4">
              <p className="font-semibold">实现技术:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>
                  监听页面的 <code>scroll</code> 事件
                </li>
                <li>
                  计算 <code>scrollTop / (scrollHeight - clientHeight)</code>{" "}
                  得到滚动百分比
                </li>
                <li>使用 CSS 动态调整进度条宽度</li>
              </ul>
            </div>
            <p>
              当前滚动位置:{" "}
              <span className="font-semibold">
                {Math.round(scrollPosition)}px
              </span>
              <br />
              滚动进度:{" "}
              <span className="font-semibold">
                {Math.round(scrollProgress)}%
              </span>
              <br />
              滚动方向:{" "}
              <span className="font-semibold">
                {scrollDirection === "down"
                  ? "向下"
                  : scrollDirection === "up"
                  ? "向上"
                  : "无"}
              </span>
            </p>
          </section>

          {/* 内容块 2 - 滚动方向检测 */}
          <section
            ref={setSectionRef(1)}
            className={`content-section mb-16 ${
              visibleSections.includes(1) ? "visible" : ""
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">2. 滚动方向感知导航栏</h3>
            <p className="mb-4">
              向下滚动页面时，导航栏会自动隐藏以提供更多的内容空间；向上滚动时，
              导航栏会重新显示，方便用户进行导航。这种模式在移动应用中很常见。
            </p>
            <div className="p-4 bg-blue-50 rounded mb-4">
              <p className="font-semibold">实现技术:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>比较当前滚动位置与上一次位置，确定滚动方向</li>
                <li>基于滚动方向应用 CSS transition 来平滑显示/隐藏导航栏</li>
                <li>
                  使用 CSS <code>transform: translateY()</code> 来移动导航栏
                </li>
              </ul>
            </div>
            <div
              className={`
              demo-navbar 
              ${navbarVisible ? "navbar-visible" : "navbar-hidden"}
            `}
            >
              <div className="navbar-content">
                <div className="navbar-logo">Logo</div>
                <div className="navbar-links">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    首页
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    关于
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    服务
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    联系
                  </a>
                </div>
              </div>
            </div>
            <p className="mt-4">
              尝试向上和向下滚动页面，观察上方导航栏的变化。当前导航栏状态:
              <span className="font-semibold">
                {" "}
                {navbarVisible ? "显示" : "隐藏"}
              </span>
            </p>
          </section>

          {/* 内容块 3 - 视差滚动 */}
          <section
            ref={setSectionRef(2)}
            className={`content-section mb-16 ${
              visibleSections.includes(2) ? "visible" : ""
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">3. 视差滚动效果</h3>
            <p className="mb-4">
              视差滚动是一种网页设计技术，当用户滚动页面时，背景内容的移动速度与前景内容的移动速度不同，
              产生深度的错觉。本页面顶部的大图就使用了视差效果，它滚动速度比正常内容慢。
            </p>
            <div className="p-4 bg-blue-50 rounded mb-4">
              <p className="font-semibold">实现技术:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>设置不同层级的元素，通常背景和前景</li>
                <li>监听滚动事件，计算不同元素的位移量</li>
                <li>
                  对背景应用 <code>transform: translateY()</code>{" "}
                  位移，速率比正常滚动慢
                </li>
                <li>
                  使用 <code>background-attachment: fixed</code>{" "}
                  实现简单视差效果
                </li>
              </ul>
            </div>
            <div className="mini-parallax">
              <div className="mini-parallax-bg">
                <div className="mini-parallax-content">
                  <h4>视差滚动示例</h4>
                  <p>滚动此区域观察效果</p>
                </div>
              </div>
            </div>
          </section>

          {/* 内容块 4 - 图片懒加载 */}
          <section
            ref={setSectionRef(3)}
            className={`content-section mb-16 ${
              visibleSections.includes(3) ? "visible" : ""
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">4. 图片懒加载</h3>
            <p className="mb-4">
              懒加载是一种优化技术，它延迟加载页面中不可见部分的图片，直到用户滚动到它们附近。
              这种技术可以提高页面初始加载速度，减少带宽使用，并优化性能。
            </p>
            <div className="p-4 bg-blue-50 rounded mb-4">
              <p className="font-semibold">实现技术:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>
                  使用 <code>IntersectionObserver</code> API
                  检测元素是否进入视口
                </li>
                <li>或者通过监听滚动事件并计算元素位置来实现</li>
                <li>
                  动态设置图片的 <code>src</code> 属性，从占位图替换为实际图片
                </li>
                <li>
                  在现代浏览器中可使用 <code>loading="lazy"</code> 属性
                </li>
              </ul>
            </div>
            <div className="image-gallery">
              {images.map((image) => (
                <div key={image.id} className="lazy-image-container">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="lazy-image"
                    loading="lazy" // 使用浏览器内置的懒加载
                    onLoad={handleImageLoad}
                  />
                  <div className="image-title">{image.title}</div>
                </div>
              ))}
            </div>
            <p className="mt-4">
              已加载图片: {imagesLoaded} / {images.length}
            </p>
          </section>

          {/* 内容块 5 - 滚动到指定位置 */}
          <section
            ref={setSectionRef(4)}
            className={`content-section mb-16 ${
              visibleSections.includes(4) ? "visible" : ""
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">5. 滚动导航与动画</h3>
            <p className="mb-4">
              页面内的滚动导航允许用户快速跳转到特定内容区域，通常与平滑滚动动画结合使用，
              提供流畅的用户体验。以下是一个简单的导航菜单，可以点击跳转到不同章节。
            </p>
            <div className="p-4 bg-blue-50 rounded mb-4">
              <p className="font-semibold">实现技术:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>
                  使用 <code>element.scrollTo()</code> 带有{" "}
                  <code>{'behavior: "smooth"'}</code> 实现平滑滚动
                </li>
                <li>
                  或使用{" "}
                  <code>
                    element.scrollIntoView({'{ behavior: "smooth" }'})
                  </code>
                </li>
                <li>滚动监听可以用来高亮当前活动的导航项</li>
                <li>使用 CSS transitions 和 animations 增强滚动动画效果</li>
              </ul>
            </div>
            <div className="scroll-nav">
              <button
                onClick={() => scrollToSection(0)}
                className={visibleSections.includes(0) ? "active" : ""}
              >
                滚动进度
              </button>
              <button
                onClick={() => scrollToSection(1)}
                className={visibleSections.includes(1) ? "active" : ""}
              >
                感知导航栏
              </button>
              <button
                onClick={() => scrollToSection(2)}
                className={visibleSections.includes(2) ? "active" : ""}
              >
                视差滚动
              </button>
              <button
                onClick={() => scrollToSection(3)}
                className={visibleSections.includes(3) ? "active" : ""}
              >
                图片懒加载
              </button>
              <button
                onClick={() => scrollToSection(4)}
                className={visibleSections.includes(4) ? "active" : ""}
              >
                滚动导航
              </button>
            </div>
            <p className="mt-4">
              当前可见内容块:{" "}
              {visibleSections.map((section) => section + 1).join(", ")}
            </p>
          </section>
        </div>
      </div>

      {/* 固定在顶部的滚动进度条 */}
      <div className="scroll-progress-container">
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* 回到顶部按钮 */}
      <button
        className={`back-to-top ${showBackToTop ? "visible" : "hidden"}`}
        onClick={scrollToTop}
        aria-label="回到顶部"
      >
        ↑
      </button>
    </div>
  );
};

export default ScrollDemo;
