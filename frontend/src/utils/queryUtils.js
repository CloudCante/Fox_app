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
    } catch (error) {
      console.error('Error importing query data:', error);
      throw new Error('Failed to import query data');
    }
  };