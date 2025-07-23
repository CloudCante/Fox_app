/**
 * Parse raw SNFN rows into:
 *  - nested station data (`data`)
 *  - allErrorCodes, allStations, allModels, and codeDesc entries
 */
export function parseSnFnData(
  rawRows,
  startDate,
  endDate,
  groupByWorkstation
) {
  const data = [];
  const codeSet = new Set();
  const stationSet = new Set();
  const modelSet = new Set();
  const descMap = new Map();

  rawRows.forEach((d) => {
    const {
      fixture_no: FN,
      sn:          SN,
      error_code:  EC,
      code_count:  TN,
      pn:          PN,
      workstation_name: BT,
      normalized_end_time: DT,
      model:       MD,
      error_disc:  ED,
    } = d;

    const recDate = new Date(DT);
    if (isNaN(recDate) || recDate < startDate || recDate > endDate) return;
    if (TN === 0) return;

    const groupKey       = groupByWorkstation ? BT : FN;
    const secondaryLabel = groupByWorkstation ? FN : BT;
    const stationIdx = data.findIndex((s) => s[0][0] === groupKey);

    codeSet.add(EC);
    stationSet.add(groupKey);
    if (MD) modelSet.add(MD);

    const descKey = groupKey + EC;
    if (!descMap.has(descKey)) descMap.set(descKey, new Set());
    descMap.get(descKey).add(ED);

    if (stationIdx === -1) {
      data.push([
        [groupKey, secondaryLabel],
        [EC, Number(TN), [[SN, PN, MD]]],
      ]);
    } else {
      const codes = data[stationIdx];
      const codeIdx = codes.findIndex((c) => c[0] === EC);
      if (codeIdx === -1) {
        codes.push([EC, Number(TN), [[SN, PN, MD]]]);
      } else {
        const serials = codes[codeIdx][2];
        if (!serials.some(([a, b, c]) => a === SN && b === PN && c === MD)) {
          serials.push([SN, PN, MD]);
        }
        codes[codeIdx][1] += Number(TN);
      }
    }
  });

  // sort codes by descending count
  data.forEach((group) => {
    group.splice(
      1,
      group.length - 1,
      ...group.slice(1).sort((a, b) => b[1] - a[1])
    );
  });

  const allErrorCodes = Array.from(codeSet).sort();
  const allStations   = Array.from(stationSet).sort();
  const allModels     = Array.from(modelSet).sort();

  // flatten descriptions back into array of [key, desc]
  const allCodeDesc = Array.from(descMap.entries()).map(([k, s]) => [
    k,
    Array.from(s).join('\n'),
  ]);

  return { data, allErrorCodes, allStations, allModels, allCodeDesc };
}
