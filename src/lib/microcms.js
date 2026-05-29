const serviceDomain = import.meta.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = import.meta.env.MICROCMS_API_KEY;

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    searchParams.set(key, String(value));
  }
  return searchParams.toString();
}

async function apiFetch(endpoint, query = {}) {
  if (!serviceDomain || !apiKey) {
    throw new Error('MICROCMS_SERVICE_DOMAIN または MICROCMS_API_KEY が設定されていません。');
  }
  const queryString = buildQuery(query);
  const url = `https://${serviceDomain}.microcms.io/api/v1/${endpoint}${queryString ? '?' + queryString : ''}`;
  const response = await fetch(url, {
    headers: { 'X-MICROCMS-API-KEY': apiKey },
  });
  if (!response.ok) throw new Error(`microCMS API error: ${response.status}`);
  return response.json();
}

async function fetchAllPages(endpoint) {
  const limit = 100;
  let offset = 0;
  const items = [];
  while (true) {
    const data = await apiFetch(endpoint, { limit, offset, orders: 'order' });
    const chunk = Array.isArray(data?.contents) ? data.contents : [];
    items.push(...chunk);
    if (chunk.length < limit) break;
    offset += limit;
  }
  return items;
}

export async function getCatalogData() {
  const [rawCategories, rawItems] = await Promise.all([
    fetchAllPages('catalog-categories'),
    fetchAllPages('catalog'),
  ]);

  const categoryMap = Object.fromEntries(
    rawCategories.map((c) => [c.id, { ...c, children: [], items: [] }])
  );

  const roots = [];
  for (const cat of rawCategories) {
    const node = categoryMap[cat.id];
    if (cat.parent?.id && categoryMap[cat.parent.id]) {
      categoryMap[cat.parent.id].children.push(node);
    } else {
      roots.push(node);
    }
  }

  for (const item of rawItems) {
    const catId = item.category?.id;
    if (catId && categoryMap[catId]) {
      categoryMap[catId].items.push(item);
    }
  }

  return roots;
}
