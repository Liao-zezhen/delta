function myers(stra, strb) {
  const m = stra.length;
  const n = strb.length;

  const V = {
    '1': 0,
  };

  const VS = {
    '0': { '1': 0 },
  };

  loop: for (let d = 0; d <= m + n; d++) {
    const tmp = {};
    let x, y;

    for (let k = -d; k <= d; k += 2) {
      if (k === -d || (k !== d && V[k + 1] > V[k - 1])) {
        x = V[k + 1];
      } else {
        x = V[k - 1] + 1;
      }
      y = x - k;
      while (x < m && y < n && stra[x] === strb[y]) {
        x++;
        y++;
      }

      V[k] = x;
      tmp[k] = x;

      if (x === m && y === n) {
        VS[d] = tmp;
        console.log(V);
        break loop;
      }
    }

    VS[d] = tmp;
  }
}

const s1 = 'ABCABBA';
const s2 = 'CBABAC';
myers(s1, s2);
