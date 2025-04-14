import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProgressBar.css';

/**
 * 页面路由跳转进度条演示组件
 * 基于 Performance API 实现路由跳转时的加载进度显示
 */
const ProgressBar = () => {
    // 进度条状态
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    // 模拟页面
    const [pages, setPages] = useState([
        { id: 1, title: '页面1', loadTime: 1000 },
        { id: 2, title: '页面2', loadTime: 2000 },
        { id: 3, title: '页面3', loadTime: 3000 },
    ]);
    const [currentPage, setCurrentPage] = useState(0);

    const navigate = useNavigate();

    /**
     * 添加日志记录
     * @param message 日志消息
     */
    const addLog = (message: string) => {
        setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    /**
     * 模拟页面加载，并使用 Performance API 计算进度
     * @param pageId 页面 ID
     * @param loadTime 模拟加载时间
     */
    const loadPage = (pageId: number, loadTime: number) => {
        // 已经在加载中，不重复加载
        if (isLoading) return;

        // 标记开始加载
        setIsLoading(true);
        setProgress(0);
        setCurrentPage(pageId);

        // 记录开始时间
        const startTime = performance.now();
        addLog(`开始加载页面 ${pageId}，预计加载时间 ${loadTime}ms`);

        // 创建一个 Performance 标记，用于记录页面加载开始
        performance.mark(`page-${pageId}-start`);

        // 使用定时器模拟加载进度
        const intervalStep = 50; // 每 50ms 更新一次进度
        const interval = setInterval(() => {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;

            // 计算加载进度，限制在 0-100 之间
            const newProgress = Math.min(Math.floor((elapsedTime / loadTime) * 100), 100);
            setProgress(newProgress);

            // 记录重要的进度节点
            if (newProgress === 25) {
                addLog(`页面 ${pageId} 加载进度: 25%`);
                performance.mark(`page-${pageId}-25pct`);
            } else if (newProgress === 50) {
                addLog(`页面 ${pageId} 加载进度: 50%`);
                performance.mark(`page-${pageId}-50pct`);
            } else if (newProgress === 75) {
                addLog(`页面 ${pageId} 加载进度: 75%`);
                performance.mark(`page-${pageId}-75pct`);
            }

            // 判断是否加载完成
            if (elapsedTime >= loadTime) {
                clearInterval(interval);
                setProgress(100);
                setIsLoading(false);

                // 记录加载完成的时间
                performance.mark(`page-${pageId}-end`);

                // 计算并记录加载过程的性能指标
                performance.measure(`page-${pageId}-total-load-time`, `page-${pageId}-start`, `page-${pageId}-end`);

                // 获取测量结果
                const measure = performance.getEntriesByName(`page-${pageId}-total-load-time`)[0];
                addLog(`页面 ${pageId} 加载完成！实际用时: ${measure.duration.toFixed(2)}ms`);

                // 清理性能标记，避免内存泄漏
                performance.clearMarks(`page-${pageId}-start`);
                performance.clearMarks(`page-${pageId}-25pct`);
                performance.clearMarks(`page-${pageId}-50pct`);
                performance.clearMarks(`page-${pageId}-75pct`);
                performance.clearMarks(`page-${pageId}-end`);
                performance.clearMeasures(`page-${pageId}-total-load-time`);
            }
        }, intervalStep);
    };

    /**
     * 添加一个新的测试页面
     */
    const addTestPage = () => {
        const newPageId = pages.length + 1;
        const randomLoadTime = Math.floor(Math.random() * 3000) + 1000; // 1-4秒之间

        setPages((prev) => [...prev, { id: newPageId, title: `页面${newPageId}`, loadTime: randomLoadTime }]);

        addLog(`添加了新测试页面：页面${newPageId}，加载时间设为 ${randomLoadTime}ms`);
    };

    /**
     * 删除一个测试页面
     * @param pageId 页面 ID
     */
    const deleteTestPage = (pageId: number) => {
        setPages((prev) => prev.filter((page) => page.id !== pageId));
        addLog(`删除了页面 ${pageId}`);
    };

    /**
     * 清空所有日志
     */
    const clearLogs = () => {
        setLogs([]);
    };

    /**
     * 获取浏览器支持的 Performance API 信息
     */
    const getPerformanceApiSupport = () => {
        const supportDetails: string[] = [];

        if (typeof window !== 'undefined' && 'performance' in window) {
            supportDetails.push('✅ Performance API 基础支持');

            if ('mark' in performance && 'measure' in performance) {
                supportDetails.push('✅ Performance.mark 和 Performance.measure 支持');
            } else {
                supportDetails.push('❌ Performance.mark 和 Performance.measure 不支持');
            }

            if ('now' in performance) {
                supportDetails.push('✅ Performance.now 支持');
            } else {
                supportDetails.push('❌ Performance.now 不支持');
            }

            if ('getEntriesByType' in performance) {
                supportDetails.push('✅ Performance.getEntriesByType 支持');
            } else {
                supportDetails.push('❌ Performance.getEntriesByType 不支持');
            }
        } else {
            supportDetails.push('❌ 当前浏览器不支持 Performance API');
        }

        return supportDetails;
    };

    /**
     * 组件首次渲染时记录页面加载时间信息
     */
    useEffect(() => {
        // 获取页面加载的性能信息
        if (typeof window !== 'undefined' && 'performance' in window) {
            // @ts-ignore - 处理老旧浏览器兼容性问题
            const timing = performance.timing || {};
            // @ts-ignore
            const navigationStart = timing.navigationStart || 0;

            if (navigationStart) {
                // @ts-ignore
                const pageLoadTime = timing.loadEventEnd - navigationStart;
                addLog(`页面完全加载用时: ${pageLoadTime}ms`);

                // 获取资源加载信息
                const resources = performance.getEntriesByType('resource');
                addLog(`加载了 ${resources.length} 个资源文件`);
            } else {
                addLog('无法获取页面导航开始时间');
            }

            // 记录 Performance API 支持情况
            getPerformanceApiSupport().forEach((detail) => addLog(detail));
        }

        // 清理函数
        return () => {
            // 清除所有与此组件相关的性能标记
            if (typeof window !== 'undefined' && 'performance' in window) {
                if ('clearMarks' in performance) performance.clearMarks();
                if ('clearMeasures' in performance) performance.clearMeasures();
            }
        };
    }, []);

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">页面路由跳转进度条 Demo</h1>

            {/* 进度条显示区域 */}
            <div className="mb-8 rounded-3xl bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-bold">路由跳转进度演示</h2>

                {/* 实际进度条 */}
                <div className="progress-container mb-4">
                    <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    ></div>
                </div>

                <div className="mb-4 text-center">
                    {isLoading ? (
                        <span className="font-medium text-blue-600">
                            正在加载页面 {currentPage}... ({progress}%)
                        </span>
                    ) : (
                        <span className="font-medium text-green-600">
                            {progress === 100 ? `页面 ${currentPage} 加载完成！` : '准备就绪，请点击下方按钮加载页面'}
                        </span>
                    )}
                </div>

                {/* 模拟页面加载按钮 */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {pages.map((page) => (
                        <div>
                            <button
                                key={page.id}
                                onClick={() => loadPage(page.id, page.loadTime)}
                                disabled={isLoading}
                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {page.title} ({page.loadTime}ms)
                            </button>
                            <button
                                onClick={() => deleteTestPage(page.id)}
                                className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                            >
                                删除
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addTestPage}
                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                        添加测试页面
                    </button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    * 页面加载时间为模拟值，括号中的数字表示页面的模拟加载时间
                </div>
            </div>

            {/* 技术说明 */}
            <div className="mb-8 rounded bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-bold">技术说明</h2>
                <div className="prose">
                    <p>
                        本 Demo 使用 <code>Performance API</code> 实现了页面加载进度条，主要技术点：
                    </p>
                    <ul className="ml-6 mt-2 list-disc">
                        <li>
                            使用 <code>performance.mark()</code> 记录加载的关键时间点
                        </li>
                        <li>
                            使用 <code>performance.measure()</code> 计算不同标记之间的时间差
                        </li>
                        <li>
                            使用 <code>performance.now()</code> 获取高精度时间戳
                        </li>
                        <li>根据已经过的时间与预期加载时间的比例计算进度</li>
                        <li>动态显示页面加载进度和记录关键加载节点</li>
                    </ul>

                    <p className="mt-4">在真实应用中，此技术可用于：</p>
                    <ul className="ml-6 mt-2 list-disc">
                        <li>提升用户体验，让用户知道页面加载的进展</li>
                        <li>收集页面性能数据，识别加载瓶颈</li>
                        <li>为复杂单页应用提供更好的导航反馈</li>
                    </ul>
                </div>
            </div>

            {/* 日志显示区域 */}
            <div className="rounded bg-white p-6 shadow-md">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">性能日志</h2>
                    <button
                        onClick={clearLogs}
                        className="rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300"
                    >
                        清空日志
                    </button>
                </div>

                <div className="h-60 overflow-y-auto rounded bg-gray-100 p-4 font-mono text-sm">
                    {logs.length > 0 ? (
                        logs.map((log, index) => (
                            <div key={index} className="mb-1">
                                {log}
                            </div>
                        ))
                    ) : (
                        <div className="flex h-full items-center justify-center text-xl font-bold text-gray-500">
                            暂无日志记录
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
