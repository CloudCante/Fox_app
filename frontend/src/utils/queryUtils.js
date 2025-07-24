import { dataCache } from "./cacheUtils";

export async function importQuery  (base, route, params) {
    try {
        const queryParams = new URLSearchParams(params);
        const res = await fetch(`${base}${route}${queryParams}`);
        if (!res.ok) {
          // Optional: Log or handle HTTP error responses
          console.error(`Server error: ${res.status} ${res.statusText}`);
          throw new Error('Failed to connect to server');
        }

        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
    console.error('importQuery error:', err);
    throw new Error(`importQuery failed: ${err.message}`);
  }
  };

export async function fetchWorkstationQuery({parameters=[], startDate, endDate,key,setDataCache,API_BASE,API_Route}) {
  const params = new URLSearchParams();
  for (const i of parameters) {
    if (i.value) {
      params.append(i.id,i.value);
    }
  }
  //params.append('model', 'Tesla SXM5');
  if (startDate) {
    const utcStartDate = new Date(startDate);
    utcStartDate.setUTCHours(0, 0, 0, 0);
    params.append('startDate', utcStartDate.toISOString());
  }
  if (endDate) {
    const utcEndDate = new Date(endDate);
    utcEndDate.setUTCHours(23, 59, 59, 999);
    params.append('endDate', utcEndDate.toISOString());
  }

  const cacheKey = `${key}_${params.toString()}`;

  const cachedData = dataCache.get(cacheKey);
  if (cachedData) {
    if(typeof setDataCache === 'function') {
      setDataCache(cachedData);
      return Promise.resolve(cachedData);
    }else{
      // Put an error message in the console if setDataCache is not a function
      console.error('setDataCache is not a function');
      return;
    }
  }

  return fetch(`${API_BASE}${API_Route}${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      const mapped = Array.isArray(data)
        ? data.map(row => ({
            station: row.workstation_name,
            pass: row.pass,
            fail: row.fail,
            failurerate: parseFloat(row.failurerate)
          }))
        : [];
      setDataCache(mapped);
      dataCache.set(cacheKey, mapped);
      return mapped;
    })
    .catch(() => {
      setDataCache([]);
      return [];
    });
};
export async function fetchFixtureQuery({parameters=[], startDate, endDate,key,setDataCache,API_BASE,API_Route}) {
  const params = new URLSearchParams();
  for (const i of parameters) {
    if (i.value) {
      params.append(i.id,i.value);
    }
  }
  if (startDate) {
    const utcStartDate = new Date(startDate);
    utcStartDate.setUTCHours(0, 0, 0, 0);
    params.append('startDate', utcStartDate.toISOString());
  }
  if (endDate) {
    const utcEndDate = new Date(endDate);
    utcEndDate.setUTCHours(23, 59, 59, 999);
    params.append('endDate', utcEndDate.toISOString());
  }

  const cacheKey = `${key}_${params.toString()}`;

  const cachedData = dataCache.get(cacheKey);
  if (cachedData) {
    if(typeof setDataCache === 'function') {
      setDataCache(cachedData);
      return Promise.resolve(cachedData);
    }else{
      // Put an error message in the console if setDataCache is not a function
      console.error('setDataCache is not a function');
      return;
    }
  }

  return fetch(`${API_BASE}${API_Route}${params.toString()}`)
    .then(res => res.json())
    .then(data => {
      const mapped = Array.isArray(data)
        ? data.map(item => ({
              station: item.fixture_no,
              pass: parseInt(item.pass),
              fail: parseInt(item.fail),
              failurerate: parseFloat(item.failurerate),
              fail_percent_of_total: parseFloat(item.fail_percent_of_total)
          }))
        : [];
      setDataCache(mapped);
      dataCache.set(cacheKey, mapped);
      return mapped;
    })
    .catch(() => {
      setDataCache([]);
      return [];
    });
};