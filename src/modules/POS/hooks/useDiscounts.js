import { useState } from "react";

export function useDiscounts() {
  const [discount, setDiscount] = useState(0); // %

  return {
    discount,
    setDiscount,
    applyDiscount(total) {
      return total - (total * discount) / 100;
    },
  };
}
