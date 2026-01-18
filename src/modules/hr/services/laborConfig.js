export const LABOR_CONFIG = {
  inss: {
    employeeRate: 0.07,
    employerRateSmall: 0.215,
    employerRateLarge: 0.225,
    employeeThreshold: 50,
  },
  ir: {
    brackets: [
      { min: 0, max: 100000, rate: 0, base: 0 },
      { min: 100001, max: 200000, rate: 0.15, base: 0 },
      { min: 200001, max: 350000, rate: 0.20, base: 15000 },
      { min: 350001, max: 500000, rate: 0.25, base: 45000 },
      { min: 500001, max: Infinity, rate: 0.30, base: 82500 },
    ],
  },
  vacation: {
    daysPerMonth: 2.5,
    maxAccumulated: 30,
    bonusRate: 0.30,
  },
  aguinaldo: {
    monthsRequired: 12,
    paymentDeadline: "December 10",
  },
  severance: {
    maxYears: 5,
    monthsPerYear: 1,
  },
};

export function calculateINSS(grossSalary) {
  return Math.round(grossSalary * LABOR_CONFIG.inss.employeeRate * 100) / 100;
}

export function calculateEmployerINSS(grossSalary, employeeCount = 1) {
  const rate = employeeCount >= LABOR_CONFIG.inss.employeeThreshold
    ? LABOR_CONFIG.inss.employerRateLarge
    : LABOR_CONFIG.inss.employerRateSmall;
  return Math.round(grossSalary * rate * 100) / 100;
}

export function calculateIR(annualGross) {
  const brackets = LABOR_CONFIG.ir.brackets;
  
  for (let i = brackets.length - 1; i >= 0; i--) {
    const bracket = brackets[i];
    if (annualGross > bracket.min) {
      const taxableAmount = annualGross - bracket.min;
      return Math.round((bracket.base + (taxableAmount * bracket.rate)) * 100) / 100;
    }
  }
  return 0;
}

export function calculateMonthlyIR(monthlyGross) {
  const annualGross = monthlyGross * 12;
  const annualINSS = calculateINSS(monthlyGross) * 12;
  const taxableIncome = annualGross - annualINSS;
  const annualIR = calculateIR(taxableIncome);
  return Math.round((annualIR / 12) * 100) / 100;
}

export function calculateNetSalary(grossSalary, commissions = 0) {
  const totalGross = grossSalary + commissions;
  const inss = calculateINSS(totalGross);
  const ir = calculateMonthlyIR(totalGross);
  const totalDeductions = inss + ir;
  const netSalary = totalGross - totalDeductions;
  
  return {
    grossSalary,
    commissions,
    totalGross,
    inss,
    ir,
    totalDeductions,
    netSalary,
  };
}

export function calculateVacationDays(monthsWorked) {
  const days = monthsWorked * LABOR_CONFIG.vacation.daysPerMonth;
  return Math.min(days, LABOR_CONFIG.vacation.maxAccumulated);
}

export function calculateVacationPay(dailySalary, vacationDays) {
  const basePay = dailySalary * vacationDays;
  const bonus = basePay * LABOR_CONFIG.vacation.bonusRate;
  return Math.round((basePay + bonus) * 100) / 100;
}

export function calculateAguinaldo(monthlySalary, monthsWorked) {
  if (monthsWorked >= 12) {
    return monthlySalary;
  }
  return Math.round((monthlySalary / 12) * monthsWorked * 100) / 100;
}

export function calculateSeverance(monthlySalary, yearsWorked) {
  const cappedYears = Math.min(yearsWorked, LABOR_CONFIG.severance.maxYears);
  const grossSeverance = monthlySalary * cappedYears;
  
  // Impuesto del 15% sobre indemnizaciones mayores a C$500,000
  const taxThreshold = 500000;
  let tax = 0;
  if (grossSeverance > taxThreshold) {
    tax = (grossSeverance - taxThreshold) * 0.15;
  }
  
  return {
    gross: Math.round(grossSeverance * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    net: Math.round((grossSeverance - tax) * 100) / 100,
  };
}

export function calculateLiquidation(monthlySalary, hireDate, vacationDaysUsed = 0, aguinaldoPaid = false) {
  const now = new Date();
  const hire = new Date(hireDate);
  const diffTime = Math.abs(now - hire);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsWorked = Math.floor(diffDays / 30);
  const yearsWorked = Math.floor(monthsWorked / 12);
  
  const dailySalary = monthlySalary / 30;
  
  const vacationDaysAccrued = calculateVacationDays(monthsWorked);
  const vacationDaysAvailable = Math.max(0, vacationDaysAccrued - vacationDaysUsed);
  const vacationPay = calculateVacationPay(dailySalary, vacationDaysAvailable);
  
  const monthsForAguinaldo = monthsWorked % 12;
  const proportionalAguinaldo = aguinaldoPaid ? 0 : calculateAguinaldo(monthlySalary, monthsForAguinaldo);
  
  const severance = calculateSeverance(monthlySalary, yearsWorked);
  
  // Total bruto (antes de impuesto sobre indemnizacion)
  const totalGross = vacationPay + proportionalAguinaldo + severance.gross;
  // Total neto (despues de impuesto sobre indemnizacion si aplica)
  const totalNet = vacationPay + proportionalAguinaldo + severance.net;
  
  return {
    monthsWorked,
    yearsWorked,
    dailySalary: Math.round(dailySalary * 100) / 100,
    vacationDaysAccrued,
    vacationDaysAvailable,
    vacationPay,
    monthsForAguinaldo,
    proportionalAguinaldo,
    severancePay: severance.gross,
    severanceTax: severance.tax,
    severanceNet: severance.net,
    totalGross: Math.round(totalGross * 100) / 100,
    total: Math.round(totalNet * 100) / 100,
  };
}