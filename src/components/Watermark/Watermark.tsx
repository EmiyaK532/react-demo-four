import { useEffect, useRef, useState } from "react";
import "./Watermark.css";

const Watermark = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const [text, setText] = useState<string>("内部文件 - 水印演示");
  const [opacity, setOpacity] = useState<number>(0.2);
  const [fontSize, setFontSize] = useState<number>(16);
  const [rotation, setRotation] = useState<number>(-30);

  /**
   * 创建水印元素
   * @returns {HTMLDivElement} 水印元素
   */
  const createWatermark = (): HTMLDivElement => {
    // 创建水印容器
    const watermarkDiv = document.createElement("div");
    watermarkDiv.className = "watermark-container";
    watermarkDiv.setAttribute("data-watermark", "true");

    // 设置样式
    Object.assign(watermarkDiv.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none", // 让水印不影响下层元素的点击
      zIndex: "1000",
      userSelect: "none", // 防止选中
    });

    // 创建水印模式
    const pattern = createWatermarkPattern();
    watermarkDiv.appendChild(pattern);

    return watermarkDiv;
  };

  /**
   * 创建水印图案 - 重复的文字元素
   */
  const createWatermarkPattern = (): HTMLDivElement => {
    const pattern = document.createElement("div");

    // 设置样式
    Object.assign(pattern.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      display: "flex",
      flexWrap: "wrap",
      overflow: "hidden",
    });

    // 计算需要创建多少个水印文字来填满页面
    const watermarkWidth = 200; // 每个水印的宽度
    const watermarkHeight = 100; // 每个水印的高度

    // 容器尺寸
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    // 计算行列数
    const columns = Math.ceil(containerWidth / watermarkWidth) + 1;
    const rows = Math.ceil(containerHeight / watermarkHeight) + 1;

    // 创建水印元素网格
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const watermarkItem = document.createElement("div");

        Object.assign(watermarkItem.style, {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: `${watermarkWidth}px`,
          height: `${watermarkHeight}px`,
          opacity: `${opacity}`,
          color: "#000",
          transform: `rotate(${rotation}deg)`,
          fontSize: `${fontSize}px`,
          fontFamily: "Arial, sans-serif",
          overflow: "hidden",
        });

        watermarkItem.textContent = text;
        pattern.appendChild(watermarkItem);
      }
    }

    return pattern;
  };

  /**
   * 添加水印到容器
   */
  const addWatermark = () => {
    if (!containerRef.current) return;

    // 移除旧的水印
    if (watermarkRef.current) {
      containerRef.current.removeChild(watermarkRef.current);
    }

    // 创建并添加新水印
    const watermark = createWatermark();
    containerRef.current.appendChild(watermark);
    watermarkRef.current = watermark;

    // 设置 MutationObserver 来监视水印是否被修改或删除
    setupObserver();
  };

  /**
   * 设置 MutationObserver 来监视 DOM 变化
   * 当水印被删除或修改时，会重新添加水印
   */
  const setupObserver = () => {
    if (!containerRef.current) return;

    // 如果有旧的 observer，先断开连接
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    const observer = new MutationObserver((mutations) => {
      let shouldRestore = false;

      for (const mutation of mutations) {
        // 检查是否有删除水印的操作
        if (mutation.type === "childList") {
          const removedNodes = Array.from(mutation.removedNodes);

          // 检查是否水印被删除
          if (
            removedNodes.some(
              (node) =>
                node instanceof HTMLElement &&
                node.getAttribute("data-watermark") === "true"
            )
          ) {
            shouldRestore = true;
            break;
          }
        }

        // 检查属性修改
        if (
          mutation.type === "attributes" &&
          mutation.target instanceof HTMLElement &&
          mutation.target.getAttribute("data-watermark") === "true"
        ) {
          shouldRestore = true;
          break;
        }
      }

      // 如果水印被删除或修改，重新添加
      if (shouldRestore) {
        console.log("水印被修改或删除，正在恢复...");
        // 暂时断开 observer 以避免无限循环
        observer.disconnect();
        // 重新添加水印
        addWatermark();
      }
    });

    // 配置 observer 监听的变化类型
    observer.observe(containerRef.current, {
      childList: true, // 监听子节点的添加或删除
      attributes: true, // 监听属性变化
      subtree: true, // 监听所有后代节点
      attributeFilter: ["style", "class", "data-watermark"], // 只监听这些属性的变化
    });

    // 保存 observer 引用
    observerRef.current = observer;
  };

  // 初始化和参数变化时更新水印
  useEffect(() => {
    addWatermark();

    // 组件卸载时清理 observer
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [text, opacity, fontSize, rotation]); // 依赖这些参数变化重新生成水印

  // 窗口大小变化时重新计算水印
  useEffect(() => {
    const handleResize = () => {
      addWatermark();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">防删除水印 Demo</h1>

      <div className="mb-8 bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">水印设置</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">水印文字</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              不透明度: {opacity}
            </label>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              字体大小: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="30"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              旋转角度: {rotation}°
            </label>
            <input
              type="range"
              min="-45"
              max="45"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">技术说明</h2>
        <div className="prose">
          <p>
            本 Demo 使用 <code>MutationObserver</code> API
            实现了防删除水印功能，主要技术点：
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>用 JavaScript 动态创建水印 DOM 元素并添加到容器</li>
            <li>
              使用 MutationObserver 监听 DOM 变化，检测水印是否被删除或修改
            </li>
            <li>当检测到水印被篡改时，自动恢复水印</li>
            <li>水印参数（文字、透明度、大小、角度）可以实时调整</li>
            <li>水印设计为不影响用户交互（pointer-events: none）</li>
          </ul>
        </div>
      </div>

      <div
        className="relative bg-white p-6 rounded shadow-md"
        style={{ minHeight: "400px" }}
        ref={containerRef}
      >
        <h2 className="text-xl font-bold mb-4 relative z-10">水印演示区域</h2>
        <p className="relative z-10 mb-4">
          这是正文内容区域，水印将显示在此区域上方。您可以尝试通过浏览器开发者工具删除水印元素，
          系统会检测到这一操作并自动恢复水印。
        </p>
        <p className="relative z-10 mb-4">
          MutationObserver 是浏览器提供的 API，用于监视 DOM
          树的变化，并在变化发生时执行回调函数。
          在这个示例中，我们用它来监测水印元素是否被篡改或删除。
        </p>
        <div className="mt-4 p-4 bg-gray-100 rounded relative z-10">
          <p>
            尝试打开浏览器控制台（F12），找到并删除带有 data-watermark="true"
            属性的 div 元素，观察系统如何自动恢复水印。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Watermark;
