export function calculateTotals(cart, discount = 0) {
  const subtotal = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const total = subtotal - discount;

  return { subtotal, discount, total };
}
