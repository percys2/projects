import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

const LABOR_CONFIG = {
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
};

function calculateINSS(grossSalary) {
  return Math.round(grossSalary * LABOR_CONFIG.inss.employeeRate * 100) / 100;
}

function calculateEmployerINSS(grossSalary, employeeCount = 1) {
  const rate = employeeCount >= LABOR_CONFIG.inss.employeeThreshold
    ? LABOR_CONFIG.inss.employerRateLarge
    : LABOR_CONFIG.inss.employerRateSmall;
  return Math.round(grossSalary * rate * 100) / 100;
}

function calculateIR(annualGross) {
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

function calculateMonthlyIR(monthlyGross) {
  const annualGross = monthlyGross * 12;
  const annualINSS = calculateINSS(monthlyGross) * 12;
  const taxableIncome = annualGross - annualINSS;
  const annualIR = calculateIR(taxableIncome);
  return Math.round((annualIR / 12) * 100) / 100;
}

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    if (!reportType) {
      return NextResponse.json({ error: "Missing report type" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select("*")
      .eq("org_id", org.id)
      .eq("status", "activo")
      .order("name", { ascending: true });

    if (empError) throw empError;

    const employeeCount = employees?.length || 0;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    let reportData = [];

    switch (reportType) {
      case "ir":
        reportData = employees.map(emp => {
          const salary = parseFloat(emp.salary) || 0;
          const commissions = parseFloat(emp.commissions) || 0;
          const totalGross = salary + commissions;
          const monthlyIR = calculateMonthlyIR(totalGross);
          const annualGross = totalGross * 12;
          const annualINSS = calculateINSS(totalGross) * 12;
          const taxableIncome = annualGross - annualINSS;
          const annualIR = calculateIR(taxableIncome);

          return {
            employee_id: emp.id,
            cedula: emp.cedula,
            inss_number: emp.inss_number,
            name: emp.name,
            position: emp.position,
            department: emp.department,
            salary: salary,
            commissions: commissions,
            total_gross: totalGross,
            monthly_ir: monthlyIR,
            annual_gross: annualGross,
            annual_inss_deduction: annualINSS,
            taxable_income: taxableIncome,
            annual_ir: annualIR,
            ir_bracket: getIRBracket(taxableIncome),
          };
        });
        break;

      case "inss":
        reportData = employees.map(emp => {
          const salary = parseFloat(emp.salary) || 0;
          const commissions = parseFloat(emp.commissions) || 0;
          const totalGross = salary + commissions;
          const employeeINSS = calculateINSS(totalGross);
          const employerINSS = calculateEmployerINSS(totalGross, employeeCount);

          return {
            employee_id: emp.id,
            cedula: emp.cedula,
            inss_number: emp.inss_number,
            name: emp.name,
            position: emp.position,
            department: emp.department,
            salary: salary,
            commissions: commissions,
            total_gross: totalGross,
            employee_inss: employeeINSS,
            employee_inss_rate: LABOR_CONFIG.inss.employeeRate * 100,
            employer_inss: employerINSS,
            employer_inss_rate: (employeeCount >= LABOR_CONFIG.inss.employeeThreshold 
              ? LABOR_CONFIG.inss.employerRateLarge 
              : LABOR_CONFIG.inss.employerRateSmall) * 100,
            total_inss: employeeINSS + employerINSS,
          };
        });
        break;

      case "salarios":
        reportData = employees.map(emp => {
          const salary = parseFloat(emp.salary) || 0;
          const commissions = parseFloat(emp.commissions) || 0;
          const totalGross = salary + commissions;
          const employeeINSS = calculateINSS(totalGross);
          const monthlyIR = calculateMonthlyIR(totalGross);
          const netSalary = totalGross - employeeINSS - monthlyIR;

          return {
            employee_id: emp.id,
            cedula: emp.cedula,
            inss_number: emp.inss_number,
            name: emp.name,
            position: emp.position,
            department: emp.department,
            hire_date: emp.hire_date,
            contract_type: emp.contract_type,
            salary: salary,
            commissions: commissions,
            gross_salary: totalGross,
            inss_deduction: employeeINSS,
            ir_deduction: monthlyIR,
            total_deductions: employeeINSS + monthlyIR,
            net_salary: netSalary,
            bank_name: emp.bank_name,
            bank_account: emp.bank_account,
          };
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    const totals = calculateTotals(reportData, reportType);

    return NextResponse.json({
      report: {
        type: reportType,
        period: { month: currentMonth, year: currentYear },
        organization: org.name,
        employee_count: employeeCount,
        generated_at: new Date().toISOString(),
        data: reportData,
        totals: totals,
      },
    });
  } catch (err) {
    console.error("Reports GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function getIRBracket(taxableIncome) {
  const brackets = LABOR_CONFIG.ir.brackets;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) {
      return `${brackets[i].rate * 100}%`;
    }
  }
  return "0%";
}

function calculateTotals(data, reportType) {
  switch (reportType) {
    case "ir":
      return {
        total_salaries: data.reduce((sum, d) => sum + d.salary, 0),
        total_commissions: data.reduce((sum, d) => sum + (d.commissions || 0), 0),
        total_gross: data.reduce((sum, d) => sum + d.total_gross, 0),
        total_monthly_ir: data.reduce((sum, d) => sum + d.monthly_ir, 0),
        total_annual_ir: data.reduce((sum, d) => sum + d.annual_ir, 0),
      };
    case "inss":
      return {
        total_salaries: data.reduce((sum, d) => sum + d.salary, 0),
        total_commissions: data.reduce((sum, d) => sum + (d.commissions || 0), 0),
        total_gross: data.reduce((sum, d) => sum + d.total_gross, 0),
        total_employee_inss: data.reduce((sum, d) => sum + d.employee_inss, 0),
        total_employer_inss: data.reduce((sum, d) => sum + d.employer_inss, 0),
        total_inss: data.reduce((sum, d) => sum + d.total_inss, 0),
      };
    case "salarios":
      return {
        total_salaries: data.reduce((sum, d) => sum + d.salary, 0),
        total_commissions: data.reduce((sum, d) => sum + (d.commissions || 0), 0),
        total_gross: data.reduce((sum, d) => sum + d.gross_salary, 0),
        total_inss: data.reduce((sum, d) => sum + d.inss_deduction, 0),
        total_ir: data.reduce((sum, d) => sum + d.ir_deduction, 0),
        total_deductions: data.reduce((sum, d) => sum + d.total_deductions, 0),
        total_net: data.reduce((sum, d) => sum + d.net_salary, 0),
      };
    default:
      return {};
  }
}
