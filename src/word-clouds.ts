export interface WordCloudConfig {
  trace: boolean;
  spiralResolution: number;
  spiralLimit: number;
  font: string;
}

export interface WordItem {
  word: string;
  freq: number;
}

/**
 * 词云
 */
export default class WordClouds {
  ctx;
  config;
  words;

  constructor(
    ctx: CanvasRenderingContext2D,
    words: WordItem[],
    config: WordCloudConfig
  ) {
    this.ctx = ctx;
    this.words = words;
    this.config = config;
  }

  start(width: number, height: number) {
    const words = this.words;
    const config = this.config;
    let middlePoint = { x: width / 2, y: height / 2 };

    const wordsPlaced = [];

    // Step:
    // 1. 测量文字的大小（长宽）
    // 2. 检测可以放置的位置 - 先采用遍历的方式
    // 3. 检测成功，放置，记录该位置

    for (let i = 0; i < words.length; i += 1) {
      const word = words[i];
      const { metric } = this.measureAndDrawText(
        word.word,
        "red",
        word.freq,
        -1000,
        0
      );

      for (let j = 0; j < config.spiralLimit; j++) {
        const { x, y } = this.spiral(j);

        const x1 = x + middlePoint.x;
        const y1 = y + middlePoint.y;
        const x2 = x1 + metric.width;
        const y2 = y1 + metric.actualBoundingBoxDescent;

        // 检测是否可放置
        let canPlace = true;

        for (let k = 0; k < wordsPlaced.length; k += 1) {
          const comparisonWord = wordsPlaced[k];
          const cx1 = comparisonWord.x;
          const cy1 = comparisonWord.y;
          const cx2 = comparisonWord.x + comparisonWord.metric.width;
          const cy2 =
            comparisonWord.y + comparisonWord.metric.actualBoundingBoxDescent;

          // 碰撞检测
          const collisionDetected =
            x1 < cx2 && x2 > cx1 && y1 < cy2 && y2 > cy1;

          if (collisionDetected) {
            // 只要有任意的碰撞就结束
            canPlace = false;
            break;
          }
        }

        // 放置文字
        if (canPlace) {
          const placeX = middlePoint.x + x;
          const placeY = middlePoint.y + y;
          const measureResult = this.measureAndDrawText(
            word.word,
            "red",
            word.freq,
            placeX,
            placeY
          );

          wordsPlaced.push(measureResult);

          break;
        }
      }
    }
  }

  /**
   * 螺旋
   *
   * @param i
   * @param callback
   */
  spiral = (i: number) => {
    const angle = this.config.spiralResolution * i;
    const x = (1 + angle) * Math.cos(angle);
    const y = (1 + angle) * Math.sin(angle);

    return { x, y };
  };

  /**
   * 测量文字的大小
   *
   * @param ctx
   * @param text
   * @param style
   * @param size
   */
  measureAndDrawText = (
    text: string,
    style: string,
    size: number,
    x: number,
    y: number
  ) => {
    const ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = style;
    ctx.textAlign = "left";
    ctx.textBaseline = "top"; // important!
    ctx.font = size + "px Arial";
    ctx.fillText(text, x, y);

    const metric = ctx.measureText(text);
    ctx.restore();

    return { x, y, metric };
  };

  trace = (x: number, y: number) => {
    this.ctx.fillRect(x, y, 1, 1);
  };

  traceSpiral = (sx: number, sy: number) => {
    const ctx = this.ctx;
    const config = this.config;

    ctx.beginPath();

    if (config.trace) {
      var frame = 1;

      const animate = () => {
        const { x, y } = this.spiral(frame);

        this.trace(sx + x, sy + y);

        frame += 1;

        if (frame < config.spiralLimit) {
          window.requestAnimationFrame(animate);
        }
      };

      animate();
    }
  };
}
