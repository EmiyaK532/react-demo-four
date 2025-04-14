# React 学习 Demo 集合

这个项目是一个使用 React 19 和 TailwindCSS 构建的 Demo 集合，用于学习和展示四种不同的 Web 前端技术实现方式。项目不依赖第三方库，而是使用原生 Web API 和 HTML5/CSS3 特性来实现各种功能。

## Demo 包含

1. **防删除水印**

   - 使用 MutationObserver API 实现
   - 可以检测和防止通过 DOM 操作删除水印
   - 支持自定义水印文字、透明度、大小和角度

2. **页面路由跳转进度条**

   - 使用 Performance API 实现
   - 展示页面加载过程的进度条
   - 记录和显示性能指标

3. **基于滚动条的交互效果**

   - 滚动进度指示器
   - 滚动方向感知导航栏
   - 视差滚动效果
   - 图片懒加载
   - 锚点导航与平滑滚动

4. **电影院选票功能**
   - 使用 Canvas API 实现
   - 交互式电影院座位选择
   - 动态价格计算
   - 支持选择/取消选择座位

## 技术栈

- React 19
- TypeScript
- TailwindCSS
- 原生 Web APIs (Canvas, MutationObserver, Performance)
- HTML5/CSS3

## 如何运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

## 项目结构

```
src/
├── components/         # 组件目录
│   ├── Watermark/      # 防删除水印组件
│   ├── ProgressBar/    # 页面进度条组件
│   ├── ScrollDemo/     # 滚动条演示组件
│   └── CinemaTicket/   # 电影院选票组件
├── App.tsx             # 主应用组件
└── main.tsx            # 应用入口
```

## 学习目的

这个项目旨在通过实际实现，展示和学习一些常见但较少使用的 Web API，而不是依赖现成的第三方库。每个 Demo 都包含详细的注释和技术说明，帮助理解实现原理。

## 许可

MIT
