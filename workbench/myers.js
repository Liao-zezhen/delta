/* eslint-disable */

const { isConstructorDeclaration } = require("typescript");

/**
 * 选择最优的上一个节点，需要遵循更多的删除操作或删除优先的原则；
 * 回溯与正向操作k的变化所表示的意思是相反的：
 * 回溯k+1对应正向k-1，是新增操作；
 * 回溯k-1对应正向k+1，是删除操作；
 * 当前(d,k)的点可以从(d-1,k-1)向右走一步，也可以从(d-1,k+1)向下走一步。
 */
function myers(stra, strb) {
  const n = stra.length;
  const m = strb.length;
  /**
   * 保存着当前的操作值；
   * V不可能与当前操作的k冲突。
   */
  const v = {
    '1': 0,
  };
  /**
   * vs保存着每次步数的坐标；
   * 对应k保存的是x轴的数值，通过x-k可以求出y轴的数值；
   */
  const vs = {
    '0': { '1': 0 }, // 由[0, -1]起始。
  };
  let d;
  
  // 循环总步数。
  loop: for (d = 0; d <= n + m; d++) {
    // 每次记录d步数可能的坐标。
    const tmp = {};

    // 循环对应步数的K值。
    for (let k = -d; k <= d; k += 2) {
      // 当前位置回溯上一步；
      // 目前知道边界但不知道坐标；
      // 如果是最小边界，那么它的上一步只能是向下操作；
      // 如果是最大边界，那么它的上一步只能是向右操作；
      // 如果处于两者之间的话，

      // 对于给定的d和k值，我们根据上一轮遍历的结果，决定当前的最佳位置，这里的最佳位置意味着取x值最大的点，因为这就意味着优先执行del操作。
      // 当前(d,k)的点可以从(d-1,k-1)向右走一步，也可以从(d-1,k+1)向下走一步。
        // 论证：从当前节点与上一个节点比较，k-1 意味着上一个节点 k+1 到当前节点，属于删除操作；
        // 从当前节点与上一个节点比较，k+1 意味着上一个节点 k-1 到当前节点，属于新增操作；
      // 当(d-1,k+1)的x值比(d-1,k-1)的大，则其优先级更高，因为它已经执行了更多的删除操作；
      // 而当具有相同的x值时，应该选择(d-1,k-1)，这时候向右走执行del操作。
      // 原则上，选择更多的删除操作或删除操作优先的节点；
      const down = k == -d || (k != d && v[k + 1] > v[k - 1]);

      // 站在未来的操作，k+1是删除操作；k-1是新增操作；
      // 站在过去的操作，k+1是新增操作；k-1是删除操作；
      // 求出上个节点的K值。
      const kPrev = down ? k + 1 : k - 1;

      // 求出上个节点的x和y的数值。
      const xStart = v[kPrev];
      const yStart = xStart - kPrev;

      // 如果是新增操作的话，x值不变；
      // 如果是删除操作的话，x值累加一。
      const xMid = down ? xStart : xStart + 1;
      const yMid = xMid - k;

      // 求出下一步的节点。
      let xEnd = xMid;
      let yEnd = yMid;

      // 如果碰到相同字符的话，x和y都累加。
      while (xEnd < n && yEnd < m && stra[xEnd] === strb[yEnd]) {
        xEnd++;
        yEnd++;
      }

      v[k] = xEnd;
      tmp[k] = xEnd;

      // 如果到达终点坐标的话，结束循环。
      if (xEnd == n && yEnd == m) {
        vs[d] = tmp;

        // 找出最短编辑脚本。
        const snakes = solution(vs, n, m, d);
        printRes(snakes, stra, strb);
        break loop;
      }
    }
    vs[d] = tmp;
  }
}
function solution(vs, n, m, d) {
  const snakes = [];
  const p = { x: n, y: m };
  for (; d > 0; d--) {
    // 找出每个步数可能的值的集合。
    const v = vs[d];
    // 找出上一个步数可能的值的集合。
    const vPrev = vs[d - 1];
    // 获取当前的K值。
    const k = p.x - p.y;

    // 获取当前坐标。
    const xEnd = v[k];
    const yEnd = xEnd - k;

    // 获取回溯的操作。
    const down = k == -d || (k != d && vPrev[k + 1] > vPrev[k - 1]);

    // 获取上一步的K值。
    const kPrev = down ? k + 1 : k - 1;

    // 获取上一步最优的坐标点。
    const xStart = vPrev[kPrev];
    const yStart = xStart - kPrev;
    const xMid = down ? xStart : xStart + 1;
    const yMid = xMid - k;

    // 存储：回溯的终点；可能经过的点，如果没有的话，就是回溯的终点；回溯的起点。
    snakes.unshift([xStart, xMid, xEnd]);

    // 更新回溯的起点。
    p.x = xStart;
    p.y = yStart;
  }
  return snakes;
}
function printRes(snakes, stra, strb) {
  console.log(snakes, stra, strb);
  const grayColor = 'color: gray';
  const redColor = 'color: red';
  const greenColor = 'color: green';
  let consoleStr = '';
  const args = [];
  let yOffset = 0;
  snakes.forEach((snake, index) => {
    const s = snake[0];
    const m = snake[1];
    const e = snake[2];
    let large = s;

    // 起始不变的。
    if (index === 0 && s !== 0) {
      for (let j = 0; j < s; j++) {
        consoleStr += `%c${stra[j]}`;
        args.push(grayColor);
        yOffset++;
      }
    }
    // 刪除
    if (m - s == 1) {
      consoleStr += `%c${stra[s]}`;
      args.push(redColor);
      large = m;
      // 添加
    } else {
      consoleStr += `%c${strb[yOffset]}`;
      args.push(greenColor);
      yOffset++;
    }
    // 不變
    for (let i = 0; i < e - large; i++) {
      consoleStr += `%c${stra[large + i]}`;
      args.push(grayColor);
      yOffset++;
    }
  });
  console.log(consoleStr, ...args);
}
let s1 = 'b1cdaa';
let s2 = '1234561';

myers(s1, s2);
