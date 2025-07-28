// src/utils/packingDataUtils.js
import { createUTCDate, toUTCDateString } from '../dateUtils';

// src/utils/packingDataUtils.js
export function rollupWeekendCounts(rawData) {
  const rolledUp = {};
  const seen = new Set();
  const allDates = [];

  // helper to format Date d → "MM/DD/YYYY"
  function fmt(d) {
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const y = d.getUTCFullYear();
    return (
      String(m).padStart(2, '0') +
      '/' +
      String(day).padStart(2, '0') +
      '/' +
      y
    );
  }

  for (const key in rawData) {
    const dateObj = rawData[key];
    const bucket = (rolledUp[key] = {});

    for (const dateStr in dateObj) {
      const count = dateObj[dateStr];
      // parse only once
      const [mo, da, yr] = dateStr.split('/');
      const d = new Date(Date.UTC(+yr, +mo - 1, +da));

      // roll weekends back to Friday
      const dow = d.getUTCDay();
      if (dow === 6)       d.setUTCDate(d.getUTCDate() - 1);
      else if (dow === 0)  d.setUTCDate(d.getUTCDate() - 2);

      const rd = fmt(d);
      bucket[rd] = (bucket[rd] || 0) + count;

      if (!seen.has(rd)) {
        seen.add(rd);
        allDates.push(rd);
      }
    }
  }

  // sort once
  allDates.sort((a, b) => {
    const [am, ad, ay] = a.split('/');
    const [bm, bd, by] = b.split('/');
    return (
      Date.UTC(+ay, +am - 1, +ad) - Date.UTC(+by, +bm - 1, +bd)
    );
  });

  return { rolledUp, sortedDates: allDates };
}
