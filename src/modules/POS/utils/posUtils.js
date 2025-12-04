export function groupByCategory(list) {
  const map = {};
  list.forEach((item) => {
    if (!map[item.category]) map[item.category] = [];
    map[item.category].push(item);
  });
  return map;
}
