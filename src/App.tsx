import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

// 导入所有 Demo 组件
import Watermark from "./components/Watermark/Watermark";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import ScrollDemo from "./components/ScrollDemo/ScrollDemo";
import CinemaTicket from "./components/CinemaTicket/CinemaTicket";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* 导航栏 */}
        <nav className="bg-white shadow-md p-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                React 学习 Demo
              </h1>
              <ul className="flex flex-wrap space-x-3 md:space-x-6">
                <li>
                  <Link
                    to="/"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    首页
                  </Link>
                </li>
                <li>
                  <Link
                    to="/watermark"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    防删除水印
                  </Link>
                </li>
                <li>
                  <Link
                    to="/progress"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    页面进度条
                  </Link>
                </li>
                <li>
                  <Link
                    to="/scroll"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    滚动条 Demo
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cinema"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    电影院选票
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* 主要内容区域 */}
        <div className="container mx-auto p-4">
          <Routes>
            <Route
              path="/"
              element={
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    React 学习 Demo 集合
                  </h2>
                  <p className="text-gray-600 mb-6">
                    这个项目包含了四个学习 Demo，旨在展示不同的 Web
                    技术实现方式，不依赖第三方库。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DemoCard
                      title="防删除水印"
                      description="使用 MutationObserver 实现防删除的水印功能"
                      link="/watermark"
                    />
                    <DemoCard
                      title="页面进度条"
                      description="使用 Performance API 实现页面路由跳转进度条"
                      link="/progress"
                    />
                    <DemoCard
                      title="滚动条 Demo"
                      description="基于滚动条的各种交互效果展示"
                      link="/scroll"
                    />
                    <DemoCard
                      title="电影院选票"
                      description="使用 Canvas 实现电影院选票功能"
                      link="/cinema"
                    />
                  </div>
                </div>
              }
            />
            <Route path="/watermark" element={<Watermark />} />
            <Route path="/progress" element={<ProgressBar />} />
            <Route path="/scroll" element={<ScrollDemo />} />
            <Route path="/cinema" element={<CinemaTicket />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// 首页中的 Demo 卡片组件
interface DemoCardProps {
  title: string;
  description: string;
  link: string;
}

function DemoCard({ title, description, link }: DemoCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        to={link}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        查看 Demo
      </Link>
    </div>
  );
}

export default App;
