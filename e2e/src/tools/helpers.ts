export const helpers = {
  getArraysDiff: (a1: any[], a2: any[]) => {
    const a: any[] = []; const diff = [];

    for (let i = 0; i < a1.length; i++) {
      a[a1[i]] = true;
    }

    for (let i = 0; i < a2.length; i++) {
      if (a[a2[i]]) {
        delete a[a2[i]];
      } else {
        a[a2[i]] = true;
      }
    }

    for (const k in a) {
      diff.push(k);
    }

    return diff;
  },

  toFixed(number: Number, fractionDigits: Number = -1) {
    const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fractionDigits) + '})?');
    const match = number.toString().match(re);
    const fixedNumber = Number(match);
    if (!fixedNumber) throw new Error(`Failed to trim decimal\'s fractional part from number: ${number}`)
    return fixedNumber;
  },

  async sleep(miliSeconds = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, miliSeconds));
  },

  stringify(json: object): string {
    return JSON.stringify(json, null, 2);
  },
};
