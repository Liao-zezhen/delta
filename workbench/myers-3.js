/* eslint-disable */

function myers(stra, strb) {
  const m = stra.length;
  const n = strb.length;

  const V = {
    '1': 0,
  };

  const max_d = m + n;
//   const max_d = Math.ceil((m + n) / 2);
  const v_offset = max_d;
  const v_length = max_d * 2;
  const A = new Array(v_length);

  for (let i = 0; i < v_length; i++) {
    A[i] = -1;
  }

  A[v_offset + 1] = 0;

  const VS = {
    '0': { '1': 0 },
  };

  loop: for (let d = 0; d <= m + n; d++) {
    const tmp = {};
    let x, y;

    for (let k = -d; k <= d; k += 2) {
    let k_offset = k + v_offset;
    //   if (k === -d || (k !== d && V[k + 1] > V[k - 1])) {
      if (k === -d || (k !== d && A[k_offset + 1] > A[k_offset - 1])) {
        x = A[k_offset + 1];
      } else {
        x = A[k_offset - 1] + 1;
      }
      y = x - k;
      while (x < m && y < n && stra[x] === strb[y]) {
        x++;
        y++;
      }

      V[k] = x;
      A[k_offset] = x;
      tmp[k] = x;

      if (x === m && y === n) {
        VS[d] = tmp;
        console.log(V);
        console.log(A);
        break loop;
      }
    }

    VS[d] = tmp;
  }
}

const s1 = 'ABCABBA';
const s2 = 'CBABAC';
myers(s1, s2);
