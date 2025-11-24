/**
 * Utilidades para cálculos de leyes laborales de Nicaragua
 * 
 * Basado en las leyes laborales vigentes de Nicaragua.
 * Fórmulas validadas según Código del Trabajo de Nicaragua.
 */

/**
 * Calcula el aguinaldo (13° mes)
 * Período: 1 de diciembre anterior al 30 de noviembre
 * 
 * Fórmula cuando trabajó 12 meses completos: Aguinaldo = Salario Mensual Promedio
 * Fórmula cuando NO trabajó 12 meses: Aguinaldo = (Salario Mensual * Días trabajados) / 365
 * 
 * @param {Object} params
 * @param {number} params.monthlySalary - Salario mensual promedio
 * @param {number} params.daysWorked - Días trabajados en el período (máx 365)
 * @returns {number} Monto de aguinaldo
 */
export function calculateAguinaldo({ monthlySalary, daysWorked }) {
  // Si trabajó 12 meses completos (365 días)
  if (daysWorked >= 365) {
    return monthlySalary;
  }
  
  // Si trabajó menos de 12 meses → proporcional
  return (monthlySalary * daysWorked) / 365;
}

/**
 * Calcula el salario mensual promedio según tipo de salario
 * @param {Object} params
 * @param {string} params.salaryType - 'fijo' | 'variable' | 'mixto'
 * @param {number} params.baseSalary - Salario base mensual
 * @param {number[]} params.last3MonthsEarnings - Array con ingresos de últimos 3 meses (para variable/mixto)
 * @returns {number} Salario mensual promedio
 */
export function calculateAverageMonthlySalary({ salaryType, baseSalary, last3MonthsEarnings = [] }) {
  if (salaryType === 'fijo') {
    return baseSalary;
  }
  
  if (salaryType === 'variable' && last3MonthsEarnings.length > 0) {
    const total = last3MonthsEarnings.reduce((sum, val) => sum + val, 0);
    return total / last3MonthsEarnings.length;
  }
  
  if (salaryType === 'mixto' && last3MonthsEarnings.length > 0) {
    const variableAvg = last3MonthsEarnings.reduce((sum, val) => sum + val, 0) / last3MonthsEarnings.length;
    return baseSalary + variableAvg;
  }
  
  return baseSalary;
}

/**
 * Calcula las vacaciones según ley de Nicaragua
 * Primer año: 15 días continuos pagados
 * Años siguientes: 15 días (no aumenta con antigüedad)
 * 
 * Si aún NO cumple 12 meses: Vacaciones = (15 días / 12 meses) * Meses trabajados
 * Pago de Vacaciones = Salario Diario Promedio * Días de Vacaciones
 * Salario Diario = Salario Mensual / 30
 * 
 * @param {Object} params
 * @param {number} params.monthsWorked - Meses trabajados
 * @param {number} params.dailySalary - Salario diario promedio
 * @param {number} params.daysTaken - Días de vacaciones ya tomados
 * @returns {Object} { daysAccrued, daysPending, amount }
 */
export function calculateVacaciones({ monthsWorked, dailySalary, daysTaken = 0 }) {
  // Días acumulados proporcionalmente
  let daysAccrued;
  
  if (monthsWorked >= 12) {
    // Si ya cumplió 12 meses, tiene derecho a 15 días completos por año
    const yearsCompleted = Math.floor(monthsWorked / 12);
    const remainingMonths = monthsWorked % 12;
    daysAccrued = (yearsCompleted * 15) + ((15 / 12) * remainingMonths);
  } else {
    // Si no ha cumplido 12 meses, se calcula proporcional
    daysAccrued = (15 / 12) * monthsWorked;
  }
  
  const daysPending = Math.max(0, daysAccrued - daysTaken);
  const amount = dailySalary * daysPending;
  
  return {
    daysAccrued: Math.round(daysAccrued * 100) / 100,
    daysPending: Math.round(daysPending * 100) / 100,
    amount,
  };
}

/**
 * Calcula la indemnización por despido sin causa según ley de Nicaragua
 * 
 * Regla:
 * - 0-3 años: 1 mes de salario por año trabajado
 * - Más de 3 años: 3 meses + 20 días por cada año adicional
 * - Máximo: 5 meses de salario
 * 
 * Fórmulas:
 * Si ≤ 3 años: Indemnización = Años trabajados * Salario Mensual Promedio
 * Si > 3 años: Indemnización = (3 * Salario Mensual) + ((Años - 3) * (Salario Diario * 20))
 * 
 * @param {Object} params
 * @param {number} params.monthlySalary - Salario mensual promedio
 * @param {number} params.yearsWorked - Años trabajados (puede ser decimal)
 * @returns {Object} { months, amount }
 */
export function calculateIndemnizacion({ monthlySalary, yearsWorked }) {
  const dailySalary = monthlySalary / 30;
  let indemnizacionAmount;
  
  if (yearsWorked <= 3) {
    // 1 mes por año trabajado
    indemnizacionAmount = yearsWorked * monthlySalary;
  } else {
    // 3 meses + 20 días por cada año adicional
    const additionalYears = yearsWorked - 3;
    indemnizacionAmount = (3 * monthlySalary) + (additionalYears * dailySalary * 20);
  }
  
  // Aplicar tope máximo de 5 meses
  const maxIndemnizacion = 5 * monthlySalary;
  indemnizacionAmount = Math.min(indemnizacionAmount, maxIndemnizacion);
  
  const months = indemnizacionAmount / monthlySalary;
  
  return {
    months: Math.round(months * 100) / 100,
    amount: indemnizacionAmount,
  };
}

/**
 * Calcula las deducciones de INSS
 * 
 * IMPORTANTE: INSS NO se descuenta de:
 * - Indemnización
 * - Aguinaldo
 * - Vacaciones acumuladas no gozadas
 * 
 * INSS SÍ se descuenta sobre:
 * - Salarios normales pendientes
 * 
 * @param {Object} params
 * @param {number} params.grossAmount - Monto bruto (solo salarios pendientes)
 * @param {number} params.employeeRate - Tasa del empleado (default: 0.07 = 7%)
 * @returns {number} Monto de deducción INSS
 */
export function calculateINSS({ grossAmount, employeeRate = 0.07 }) {
  return grossAmount * employeeRate;
}

/**
 * Calcula la liquidación completa de un empleado según leyes de Nicaragua
 * 
 * @param {Object} params
 * @param {Object} params.employee - Datos del empleado
 * @param {Date} params.terminationDate - Fecha de terminación
 * @param {string} params.terminationType - Tipo: 'sin_causa' | 'con_causa' | 'renuncia'
 * @param {Object} params.config - Configuración (opcional, para compatibilidad)
 * @returns {Object} Desglose completo de liquidación
 */
export function calculateLiquidacion({
  employee,
  terminationDate,
  terminationType,
  config = {},
}) {
  const hireDate = new Date(employee.hire_date);
  const endDate = new Date(terminationDate);
  
  // Calcular tiempo trabajado
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysDiff = (endDate - hireDate) / millisecondsPerDay;
  const yearsWorked = daysDiff / 365;
  const monthsWorked = (daysDiff / 365) * 12;
  
  const monthlySalary = employee.salary || 0;
  const dailySalary = monthlySalary / 30;
  
  // 1. Salarios pendientes (días del mes actual)
  const currentMonthDays = endDate.getDate();
  const pendingSalary = dailySalary * currentMonthDays;
  
  // 2. Aguinaldo proporcional
  // Calcular días trabajados desde el último período de aguinaldo (1 dic - 30 nov)
  const currentYear = endDate.getFullYear();
  const lastAguinaldoStart = new Date(currentYear - 1, 11, 1); // 1 dic año anterior
  const aguinaldoPeriodStart = lastAguinaldoStart > hireDate ? lastAguinaldoStart : hireDate;
  const daysInAguinaldoPeriod = Math.min(365, (endDate - aguinaldoPeriodStart) / millisecondsPerDay);
  
  const aguinaldo = calculateAguinaldo({
    monthlySalary,
    daysWorked: daysInAguinaldoPeriod,
  });
  
  // 3. Vacaciones pendientes (15 días por año, proporcional)
  const vacaciones = calculateVacaciones({
    monthsWorked,
    dailySalary,
    daysTaken: employee.vacation_days_taken || 0,
  });
  
  // 4. Indemnización (solo si es despido sin causa)
  let indemnizacion = { months: 0, amount: 0 };
  if (terminationType === 'sin_causa') {
    indemnizacion = calculateIndemnizacion({
      monthlySalary,
      yearsWorked,
    });
  }
  
  // 5. Cálculo de deducciones
  // INSS solo se descuenta sobre salarios pendientes
  // NO se descuenta sobre aguinaldo, vacaciones, ni indemnización
  const inssDeduction = calculateINSS({
    grossAmount: pendingSalary,
    employeeRate: config.inss_employee_rate || 0.07,
  });
  
  // IR NO aplica sobre indemnización, vacaciones, ni preaviso
  const irDeduction = 0;
  
  // 6. Totales
  const totalBruto = pendingSalary + aguinaldo + vacaciones.amount + indemnizacion.amount;
  const totalDeducciones = inssDeduction + irDeduction;
  const totalNeto = totalBruto - totalDeducciones;
  
  return {
    employee: {
      name: employee.full_name,
      hire_date: hireDate.toISOString().split('T')[0],
      termination_date: endDate.toISOString().split('T')[0],
      years_worked: Math.round(yearsWorked * 100) / 100,
      monthly_salary: monthlySalary,
      daily_salary: dailySalary,
    },
    breakdown: {
      pending_salary: {
        days: currentMonthDays,
        amount: pendingSalary,
        inss_applies: true,
      },
      aguinaldo: {
        days: Math.round(daysInAguinaldoPeriod),
        amount: aguinaldo,
        inss_applies: false,
      },
      vacaciones: {
        days_accrued: vacaciones.daysAccrued,
        days_taken: employee.vacation_days_taken || 0,
        days_pending: vacaciones.daysPending,
        amount: vacaciones.amount,
        inss_applies: false,
      },
      indemnizacion: {
        applicable: terminationType === 'sin_causa',
        months: indemnizacion.months,
        amount: indemnizacion.amount,
        inss_applies: false,
        ir_applies: false,
      },
    },
    deductions: {
      inss: {
        base: pendingSalary,
        rate: config.inss_employee_rate || 0.07,
        amount: inssDeduction,
        note: 'Solo sobre salarios pendientes',
      },
      ir: {
        amount: irDeduction,
        note: 'No aplica sobre indemnización, vacaciones ni preaviso',
      },
    },
    totals: {
      total_bruto: totalBruto,
      total_deducciones: totalDeducciones,
      total_neto: totalNeto,
    },
    termination_type: terminationType,
    legal_note: 'Cálculo basado en el Código del Trabajo de Nicaragua. Validar con contador o asesor legal.',
  };
}
