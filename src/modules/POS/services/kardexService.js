// src/modules/POS/services/kardexService.js

let KARDEX_DB = [];

export const kardexService = {
  addMovement(item) {
    KARDEX_DB.push({
      ...item,
      timestamp: new Date().toISOString(),
    });
  },

  getKardex() {
    return KARDEX_DB;
  },
};
