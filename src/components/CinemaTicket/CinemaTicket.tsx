import { useEffect, useRef, useState } from "react";
import "./CinemaTicket.css";

/**
 * 电影院选票功能演示组件
 * 使用 Canvas 实现电影院座位选择与票务功能
 *
 * 主要功能：
 * 1. 可视化电影院座位布局
 * 2. 实时座位选择与取消
 * 3. 电影选择与价格计算
 * 4. 模拟订票流程
 */
const CinemaTicket = () => {
  // ===== 组件状态管理 =====

  // Canvas 引用 - 用于直接操作画布
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 座位数据二维数组 - 存储整个影院的座位状态
  const [seats, setSeats] = useState<SeatType[][]>([]);

  // 已选座位列表 - 存储用户当前选中的座位位置
  const [selectedSeats, setSelectedSeats] = useState<
    { row: number; col: number }[]
  >([]);

  // 电影列表数据 - 可供选择的电影及其价格
  const [movies, setMovies] = useState([
    { id: 1, title: "复仇者联盟4：终局之战", price: 38 },
    { id: 2, title: "黑豹", price: 40 },
    { id: 3, title: "小丑", price: 42 },
    { id: 4, title: "速度与激情9", price: 45 },
  ]);

  // 当前选中的电影
  const [selectedMovie, setSelectedMovie] = useState(movies[0]);

  // ===== 绘图参数设置 =====

  // 画布尺寸配置
  const canvasWidth = 800; // 画布宽度
  const canvasHeight = 500; // 画布高度

  // 座位尺寸与间距设置
  const seatSize = 28; // 座位大小 - 增大了座位尺寸使更易点击
  const seatSpacing = 6; // 座位之间的水平间距
  const rowSpacing = 16; // 行之间的额外垂直间距

  // 座位颜色配置
  const seatColors = {
    available: "#3a3a48", // 可选座位 - 深灰色
    selected: "#4ECDC4", // 已选座位 - 青绿色
    occupied: "#fc5c65", // 已售座位 - 红色
    hover: "#a7f3ef", // 鼠标悬停 - 浅青绿色
    seatTop: "#ffffff22", // 座位顶部高光
  };

  // 当前鼠标悬停的座位位置
  const [hoverSeat, setHoverSeat] = useState<{
    row: number;
    col: number;
  } | null>(null);

  /**
   * 座位类型枚举
   * 用于表示座位的不同状态
   */
  enum SeatType {
    Empty = 0, // 无座位（过道、空隙等）
    Available = 1, // 可选座位
    Occupied = 2, // 已售出座位
  }

  /**
   * 初始化座位布局
   * 创建影院座位矩阵并随机设置一些已售座位
   */
  const initializeSeats = () => {
    // 创建8行，每行12个座位的电影院布局
    const newSeats: SeatType[][] = [];

    // 标准影院座位布局 - 示例
    // 0 表示无座位（过道），1 表示可用座位，2 表示已占用座位
    // 设计更符合实际影院的座位布局，中间和两侧有过道
    newSeats.push([0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0]);
    newSeats.push([0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]);
    newSeats.push([0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]);
    newSeats.push([1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1]);
    newSeats.push([1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1]);
    newSeats.push([1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1]);
    newSeats.push([1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1]);
    newSeats.push([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

    // 使用伪随机算法设置一些座位为已占用
    // 使用固定种子使每次刷新页面的座位布局保持一致
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    let seed = 1;

    // 随机设置约20%的座位为已占用
    newSeats.forEach((row, rowIndex) => {
      row.forEach((seat, seatIndex) => {
        seed = seed + 1;
        // 只对可用座位进行随机占用
        if (seat === SeatType.Available && random(seed) < 0.2) {
          newSeats[rowIndex][seatIndex] = SeatType.Occupied;
        }
      });
    });

    // 更新座位状态
    setSeats(newSeats);
  };

  /**
   * 绘制整个影院布局
   * 这是绘制流程的主入口函数，按顺序调用各个绘制函数
   */
  const drawCinema = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布，准备重新绘制
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 设置整体背景色 - 深色背景更符合电影院氛围
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    bgGradient.addColorStop(0, "#1e1e2a");
    bgGradient.addColorStop(1, "#252538");

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制装饰性元素
    drawDecorations(ctx);

    // 绘制电影银幕
    drawScreen(ctx);

    // 绘制所有座位
    drawSeats(ctx);

    // 绘制图例说明
    drawLegend(ctx);

    // 绘制行号和列号
    drawRowColNumbers(ctx);
  };

  /**
   * 绘制装饰性元素
   * 增加视觉效果和电影院氛围
   */
  const drawDecorations = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // 绘制顶部和底部的装饰线条
    ctx.strokeStyle = "#ffffff22";
    ctx.lineWidth = 2;

    // 顶部线条
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(canvasWidth - 50, 20);
    ctx.stroke();

    // 底部线条
    ctx.beginPath();
    ctx.moveTo(50, canvasHeight - 20);
    ctx.lineTo(canvasWidth - 50, canvasHeight - 20);
    ctx.stroke();

    // 绘制角落装饰
    const drawCorner = (x: number, y: number, dir: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dir * 15, y);
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 15);
      ctx.stroke();
    };

    drawCorner(50, 20, 1);
    drawCorner(canvasWidth - 50, 20, -1);
    drawCorner(50, canvasHeight - 20, 1);
    drawCorner(canvasWidth - 50, canvasHeight - 20, -1);

    ctx.restore();
  };

  /**
   * 绘制电影银幕
   * 增强银幕视觉效果，更真实地模拟影院银幕
   */
  const drawScreen = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // 设置银幕参数
    const screenWidth = 550;
    const screenHeight = 35;
    const screenX = (canvasWidth - screenWidth) / 2;
    const screenY = 40;

    // 绘制银幕阴影
    ctx.shadowColor = "rgba(154, 230, 253, 0.3)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;

    // 创建银幕渐变
    const gradient = ctx.createLinearGradient(
      screenX,
      screenY + screenHeight,
      screenX,
      screenY
    );
    gradient.addColorStop(0, "#203850");
    gradient.addColorStop(0.5, "#2c5270");
    gradient.addColorStop(1, "#254865");

    // 绘制银幕主体
    ctx.fillStyle = gradient;
    ctx.roundRect(screenX, screenY, screenWidth, screenHeight, 3);
    ctx.fill();

    // 绘制银幕边框
    ctx.strokeStyle = "#4a7a9c";
    ctx.lineWidth = 1;
    ctx.roundRect(screenX, screenY, screenWidth, screenHeight, 3);
    ctx.stroke();

    // 银幕底部投影效果
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.moveTo(screenX - 15, screenY + screenHeight + 1);
    ctx.lineTo(screenX + screenWidth + 15, screenY + screenHeight + 1);
    ctx.lineTo(screenX + screenWidth + 25, screenY + screenHeight + 10);
    ctx.lineTo(screenX - 25, screenY + screenHeight + 10);
    ctx.closePath();
    ctx.fill();

    // 添加银幕文字
    ctx.fillStyle = "#9fe9ff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("银幕", canvasWidth / 2, screenY + screenHeight / 2);

    ctx.restore();
  };

  /**
   * 绘制所有座位
   * 遍历座位矩阵并绘制每个有效座位
   */
  const drawSeats = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // 计算座位区域布局参数
    const totalRows = seats.length;
    const totalCols = seats[0]?.length || 0;
    const totalWidth = totalCols * (seatSize + seatSpacing) - seatSpacing;
    const totalHeight =
      totalRows * (seatSize + seatSpacing + rowSpacing) - rowSpacing;

    // 确定座位绘制的起始位置（居中布局）
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = 120; // 银幕下方留出足够空间

    // 绘制座位区域背景
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(startX - 25, startY - 15, totalWidth + 50, totalHeight + 30);

    // 添加"舞台方向"提示
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("舞台方向 ↑", canvasWidth / 2, startY - 5);

    // 遍历座位矩阵并绘制每个座位
    seats.forEach((row, rowIndex) => {
      row.forEach((seat, colIndex) => {
        // 计算当前座位的坐标位置
        const x = startX + colIndex * (seatSize + seatSpacing);
        const y = startY + rowIndex * (seatSize + seatSpacing + rowSpacing);

        // 只有非空座位需要绘制
        if (seat !== SeatType.Empty) {
          // 确定座位颜色
          let fillColor = seatColors.available;

          // 检查座位是否已被选中
          const isSelected = selectedSeats.some(
            (s) => s.row === rowIndex && s.col === colIndex
          );

          // 根据座位状态设置不同的颜色
          if (isSelected) {
            fillColor = seatColors.selected;
          } else if (seat === SeatType.Occupied) {
            fillColor = seatColors.occupied;
          }

          // 检查是否鼠标悬停在座位上
          if (
            hoverSeat &&
            hoverSeat.row === rowIndex &&
            hoverSeat.col === colIndex &&
            seat === SeatType.Available &&
            !isSelected
          ) {
            fillColor = seatColors.hover;
          }

          // 绘制座位
          drawSeat(ctx, x, y, fillColor);

          // 显示座位编号（仅在选中或悬停时显示）
          if (
            seat !== SeatType.Occupied &&
            (isSelected ||
              (hoverSeat?.row === rowIndex && hoverSeat?.col === colIndex))
          ) {
            ctx.fillStyle = "#fff";
            ctx.font = "11px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const seatNumber = colIndex + 1;
            ctx.fillText(
              `${rowIndex + 1}-${seatNumber}`,
              x + seatSize / 2,
              y + seatSize / 2
            );
          }
        }
      });
    });

    ctx.restore();
  };

  /**
   * 绘制单个座位
   * 使用圆角矩形绘制椅子形状，添加高光和阴影增强3D效果
   */
  const drawSeat = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) => {
    ctx.save();

    // 座位阴影效果
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 绘制座位底部（主体）
    ctx.fillStyle = color;
    ctx.roundRect(x, y, seatSize, seatSize, 5);
    ctx.fill();

    // 绘制座位靠背
    ctx.shadowColor = "transparent";
    ctx.fillStyle = getLighterColor(color, 10);
    ctx.roundRect(x + 2, y + 2, seatSize - 4, seatSize / 2 - 3, 3);
    ctx.fill();

    // 座位顶部（坐垫部分，稍亮一点以增加立体感）
    ctx.fillStyle = getLighterColor(color, 20);
    ctx.roundRect(
      x + 2,
      y + seatSize / 2 + 2,
      seatSize - 4,
      seatSize / 2 - 4,
      3
    );
    ctx.fill();

    // 添加座位高光效果
    ctx.fillStyle = seatColors.seatTop;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + seatSize / 2 + 3);
    ctx.lineTo(x + seatSize - 3, y + seatSize / 2 + 3);
    ctx.lineTo(x + seatSize - 5, y + seatSize - 5);
    ctx.lineTo(x + 5, y + seatSize - 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  /**
   * 获取更亮的颜色
   * 用于创建座位立体感的辅助函数
   * @param color 原始颜色（十六进制格式）
   * @param percent 提亮百分比
   * @returns 提亮后的RGB颜色
   */
  const getLighterColor = (color: string, percent: number): string => {
    // 十六进制颜色转RGB辅助函数
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [0, 0, 0];
    };

    // 计算提亮后的RGB值
    const rgb = hexToRgb(color);
    const lighter = rgb.map((c) =>
      Math.min(255, c + ((255 - c) * percent) / 100)
    );

    return `rgb(${lighter[0]}, ${lighter[1]}, ${lighter[2]})`;
  };

  /**
   * 绘制图例说明
   * 在画布底部展示不同类型座位的图例
   */
  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    const legendY = canvasHeight - 50;
    const spacing = 140; // 增加间距使图例更清晰

    // 图例项定义
    const legendItems = [
      { color: seatColors.available, label: "可选座位" },
      { color: seatColors.selected, label: "已选座位" },
      { color: seatColors.occupied, label: "已售座位" },
    ];

    // 绘制图例背景
    ctx.fillStyle = "rgba(30,30,45,0.7)";
    ctx.roundRect(canvasWidth / 2 - 230, legendY - 15, 460, 40, 10);
    ctx.fill();

    // 绘制各个图例项
    legendItems.forEach((item, index) => {
      const x =
        canvasWidth / 2 -
        ((legendItems.length - 1) * spacing) / 2 +
        index * spacing;

      // 绘制小尺寸的示例座位
      const smallSeatSize = seatSize * 0.8;
      drawSeat(ctx, x - 40, legendY, item.color);

      // 绘制图例文字
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(item.label, x, legendY + smallSeatSize / 2);
    });

    ctx.restore();
  };

  /**
   * 绘制行号和列号
   * 帮助用户确定座位位置
   */
  const drawRowColNumbers = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    // 计算布局参数
    const totalRows = seats.length;
    const totalCols = seats[0]?.length || 0;
    const totalWidth = totalCols * (seatSize + seatSpacing) - seatSpacing;

    const startX = (canvasWidth - totalWidth) / 2;
    const startY = 120;

    // 设置文字样式
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px Arial";

    // 绘制行号
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    seats.forEach((_, rowIndex) => {
      const y =
        startY +
        rowIndex * (seatSize + seatSpacing + rowSpacing) +
        seatSize / 2;
      ctx.fillText(`${rowIndex + 1}排`, startX - 10, y);
    });

    // 绘制列号（仅在顶部和底部）
    ctx.textAlign = "center";

    // 为了避免过于拥挤，只显示部分列号
    for (let col = 0; col < totalCols; col += 2) {
      // 检查该列是否至少有一个有效座位
      const hasValidSeat = seats.some((row) => row[col] !== SeatType.Empty);

      if (hasValidSeat) {
        const x = startX + col * (seatSize + seatSpacing) + seatSize / 2;

        // 顶部列号
        ctx.fillText(`${col + 1}号`, x, startY - 10);

        // 底部列号
        const bottomY =
          startY + totalRows * (seatSize + seatSpacing + rowSpacing) + 10;
        ctx.fillText(`${col + 1}号`, x, bottomY);
      }
    }

    ctx.restore();
  };

  /**
   * 处理座位点击事件
   * 实现座位选择和取消功能
   * @param event 鼠标点击事件
   */
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 获取点击坐标（相对于画布）
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // 处理高分辨率显示器的缩放
    const scaleY = canvas.height / rect.height; // 处理高分辨率显示器的缩放

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // 查找点击的座位
    const clickedSeat = findSeatByCoordinates(x, y);

    // 如果找到座位，处理座位状态切换
    if (clickedSeat) {
      const { row, col } = clickedSeat;

      // 只处理可选座位
      if (seats[row][col] === SeatType.Available) {
        // 检查是否已选中
        const isAlreadySelected = selectedSeats.some(
          (s) => s.row === row && s.col === col
        );

        if (isAlreadySelected) {
          // 取消选中状态
          setSelectedSeats(
            selectedSeats.filter((s) => !(s.row === row && s.col === col))
          );

          // 添加点击反馈
          provideFeedback(canvas, x, y, "#ff5555");
        } else {
          // 添加到已选列表
          setSelectedSeats([...selectedSeats, { row, col }]);

          // 添加点击反馈
          provideFeedback(canvas, x, y, "#55ff7f");
        }
      } else if (seats[row][col] === SeatType.Occupied) {
        // 已售座位的视觉反馈（抖动效果）
        provideFeedback(canvas, x, y, "#ff3333");
      }
    }
  };

  /**
   * 提供视觉反馈
   * 当用户点击座位时添加动画效果
   */
  const provideFeedback = (
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    color: string
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 创建并添加点击波纹效果
    const startTime = Date.now();
    const duration = 300; // 动画持续300毫秒

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 绘制一个扩散的圆形
      ctx.save();
      ctx.globalAlpha = 1 - progress; // 逐渐消失
      ctx.beginPath();
      ctx.arc(x, y, progress * 30, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 动画结束后重绘画布
        drawCinema();
      }
    };

    animate();
  };

  /**
   * 处理鼠标移动事件
   * 实现座位悬停效果
   * @param event 鼠标移动事件
   */
  const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 获取鼠标坐标（相对于画布）
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; // 处理高分辨率显示器的缩放
    const scaleY = canvas.height / rect.height; // 处理高分辨率显示器的缩放

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // 查找鼠标下方的座位
    const seat = findSeatByCoordinates(x, y);

    // 更新悬停状态
    if (seat) {
      const { row, col } = seat;
      // 只在可用座位上显示悬浮效果
      if (seats[row][col] === SeatType.Available) {
        // 检查悬停状态是否改变
        if (!hoverSeat || hoverSeat.row !== row || hoverSeat.col !== col) {
          setHoverSeat({ row, col });
          // 设置指针样式为手型
          canvas.style.cursor = "pointer";
        }
      } else {
        if (seats[row][col] === SeatType.Occupied) {
          // 已售座位使用禁止标志
          canvas.style.cursor = "not-allowed";
        } else {
          // 非座位区域使用默认指针
          canvas.style.cursor = "default";
        }
        setHoverSeat(null);
      }
    } else {
      // 鼠标不在任何座位上
      canvas.style.cursor = "default";
      setHoverSeat(null);
    }
  };

  /**
   * 处理鼠标离开事件
   * 清除悬停状态
   */
  const handleCanvasMouseLeave = () => {
    setHoverSeat(null);

    // 恢复默认指针样式
    if (canvasRef.current) {
      canvasRef.current.style.cursor = "default";
    }
  };

  /**
   * 根据坐标查找对应的座位
   * 通过比较鼠标坐标和座位位置判断用户点击了哪个座位
   * @param x 鼠标X坐标
   * @param y 鼠标Y坐标
   * @returns 找到的座位位置，未找到则返回null
   */
  const findSeatByCoordinates = (x: number, y: number) => {
    const totalRows = seats.length;
    const totalCols = seats[0]?.length || 0;
    const totalWidth = totalCols * (seatSize + seatSpacing) - seatSpacing;

    const startX = (canvasWidth - totalWidth) / 2;
    const startY = 120;

    // 增加点击容忍度，使用户更容易点中座位
    const hitboxExpansion = 2;

    // 遍历所有座位计算位置
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalCols; col++) {
        // 跳过空座位
        if (seats[row][col] === SeatType.Empty) {
          continue;
        }

        // 计算座位的实际位置
        const seatX = startX + col * (seatSize + seatSpacing);
        const seatY = startY + row * (seatSize + seatSpacing + rowSpacing);

        // 检查点击坐标是否在这个座位的范围内（带点击容忍度）
        if (
          x >= seatX - hitboxExpansion &&
          x <= seatX + seatSize + hitboxExpansion &&
          y >= seatY - hitboxExpansion &&
          y <= seatY + seatSize + hitboxExpansion
        ) {
          return { row, col };
        }
      }
    }

    // 未找到匹配的座位
    return null;
  };

  /**
   * 处理电影选择变化
   * @param event 选择框变化事件
   */
  const handleMovieChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const movieId = parseInt(event.target.value);
    const movie = movies.find((m) => m.id === movieId);

    if (movie) {
      setSelectedMovie(movie);
      // 更换电影时清空已选座位
      setSelectedSeats([]);
    }
  };

  /**
   * 计算总票价
   * @returns 所有已选座位的总价
   */
  const calculateTotal = () => {
    return selectedSeats.length * (selectedMovie?.price || 0);
  };

  /**
   * 提交订单
   * 模拟购票流程
   */
  const handleCheckout = () => {
    if (selectedSeats.length === 0) {
      alert("请先选择座位");
      return;
    }

    // 在实际应用中，这里会提交到服务器进行订单处理
    // 为了演示，使用弹窗显示订单信息
    alert(`
      恭喜！购票成功！
      
      电影: ${selectedMovie.title}
      座位: ${selectedSeats
        .map((s) => `${s.row + 1}排${s.col + 1}号`)
        .join(", ")}
      总价: ¥${calculateTotal().toFixed(2)}
    `);

    // 更新已售座位状态
    const newSeats = [...seats];

    selectedSeats.forEach(({ row, col }) => {
      if (newSeats[row] && newSeats[row][col] === SeatType.Available) {
        newSeats[row][col] = SeatType.Occupied;
      }
    });

    // 更新状态
    setSeats(newSeats);
    setSelectedSeats([]);
  };

  /**
   * 清除已选座位
   */
  const handleClearSelection = () => {
    setSelectedSeats([]);
  };

  // 初始化座位布局
  useEffect(() => {
    initializeSeats();
  }, []);

  // 当相关状态变化时重绘画布
  useEffect(() => {
    // 添加 roundRect polyfill（如果浏览器不支持）
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function (
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
      ) {
        // 标准化半径
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;

        // 绘制圆角矩形路径
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
      };
    }

    // 绘制电影院界面
    drawCinema();
  }, [seats, selectedSeats, hoverSeat]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">电影院选票 Demo</h1>

      <div className="mb-6 flex flex-col md:flex-row gap-6">
        {/* 左侧控制面板 */}
        <div className="bg-white p-6 rounded shadow-md flex-1 md:max-w-xs cinema-panel">
          <h2 className="text-xl font-bold mb-4">订票信息</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">选择电影:</label>
            <select
              value={selectedMovie.id}
              onChange={handleMovieChange}
              className="w-full p-2 border rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title} (¥{movie.price})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">已选座位:</label>
            {selectedSeats.length > 0 ? (
              <ul className="bg-gray-100 p-3 rounded max-h-32 overflow-y-auto">
                {selectedSeats.map((seat, index) => (
                  <li
                    key={index}
                    className="mb-1 flex justify-between items-center"
                  >
                    <span>
                      {seat.row + 1}排{seat.col + 1}号
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSeats(
                          selectedSeats.filter((s, i) => i !== index)
                        );
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 bg-gray-100 p-3 rounded">
                请在座位图上选择座位
              </p>
            )}
          </div>

          <div className="mb-6 p-4 bg-gray-100 rounded">
            <label className="block text-gray-700 mb-2 font-bold">总计:</label>
            <div className="text-3xl font-bold text-green-600">
              ¥{calculateTotal().toFixed(2)}
            </div>
            <div className="text-gray-500 text-sm">
              {selectedSeats.length} 张票 × ¥{selectedMovie.price}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCheckout}
              disabled={selectedSeats.length === 0}
              className={`px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 flex-1 transition-colors ${
                selectedSeats.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              确认购票
            </button>
            <button
              onClick={handleClearSelection}
              disabled={selectedSeats.length === 0}
              className={`px-4 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors ${
                selectedSeats.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              清空选择
            </button>
          </div>

          {/* 简易操作指南 */}
          <div className="mt-4 text-gray-500 text-xs">
            <p className="mb-1">• 点击可选座位(深灰色)进行选择</p>
            <p className="mb-1">• 已售座位(红色)无法选择</p>
            <p>• 再次点击已选座位可取消选择</p>
          </div>
        </div>

        {/* 右侧座位图 */}
        <div className="flex-1 bg-white p-6 rounded shadow-md overflow-hidden cinema-panel">
          <h2 className="text-xl font-bold mb-4">座位选择</h2>
          <div className="seat-container overflow-auto text-center">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              className="cursor-pointer canvas-with-shadow"
            />
          </div>
        </div>
      </div>

      {/* 技术说明 */}
      <div className="bg-white p-6 rounded shadow-md cinema-panel">
        <h2 className="text-xl font-bold mb-4">技术说明</h2>
        <div className="prose">
          <p>
            本 Demo 使用 <code>Canvas API</code>{" "}
            实现了电影院选票功能，主要技术点：
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li>使用 Canvas 绘制交互式座位图，支持选座、高亮和动画效果</li>
            <li>通过坐标计算和点击检测实现精确的座位选择</li>
            <li>添加视觉反馈（高亮、动画）提升用户体验</li>
            <li>座位和价格动态计算，模拟真实订票流程</li>
            <li>使用渐变、阴影和光照效果创造3D立体感</li>
            <li>针对高分辨率屏幕优化以保证精确点击</li>
            <li>响应式设计，适应不同屏幕尺寸</li>
          </ul>
          <p className="mt-4">
            这种交互式座位选择在许多实际应用中很常见，包括电影票、演唱会、体育赛事等订票系统。
            通过 Canvas 可以高效地绘制大量元素，并提供流畅的交互体验。
          </p>
        </div>
      </div>
    </div>
  );
};

// 为 Canvas 添加 roundRect 方法的类型定义
declare global {
  interface CanvasRenderingContext2D {
    roundRect(
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ): CanvasRenderingContext2D;
  }
}

export default CinemaTicket;
