import React from "react";

export default function PayrollSummary({ employees, attendance }) {
  const calculatePayroll = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    return employees.map((employee) => {
      const monthAttendance = attendance.filter(
        (a) => a.employee_id === employee.id && a.date.startsWith(currentMonth)
      );

      const presentDays = monthAttendance.filter((a) => a.status === "present").length;
      const absentDays = monthAttendance.filter((a) => a.status === "absent").length;
      const leaveDays = monthAttendance.filter((a) => a.status === "leave").length;

      const dailySalary = employee.salary / 30;
      const deductions = dailySalary * absentDays;
      const netSalary = employee.salary - deductions;

      return {
        ...employee,
        presentDays,
        absentDays,
        leaveDays,
        deductions,
        netSalary,
      };
    });
  };

  const payrollData = calculatePayroll();
  const totalPayroll = payrollData.reduce((sum, e) => sum + e.netSalary, 0);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded border">
        <p className="text-xs text-slate-600">Nómina Total del Mes</p>
        <p className="text-2xl font-bold text-blue-600">
          C$ {totalPayroll.toFixed(2)}
        </p>
      </div>

      {payrollData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No hay empleados para calcular nómina</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-slate-600">
                <th className="pb-2 font-medium">Empleado</th>
                <th className="pb-2 font-medium">Puesto</th>
                <th className="pb-2 font-medium text-right">Salario Base</th>
                <th className="pb-2 font-medium text-center">Días Presente</th>
                <th className="pb-2 font-medium text-center">Días Ausente</th>
                <th className="pb-2 font-medium text-right">Deducciones</th>
                <th className="pb-2 font-medium text-right">Salario Neto</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((employee) => (
                <tr key={employee.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 text-sm font-medium">
                    {employee.full_name}
                  </td>
                  <td className="py-3 text-sm">{employee.position}</td>
                  <td className="py-3 text-sm text-right">
                    C$ {employee.salary.toFixed(2)}
                  </td>
                  <td className="py-3 text-sm text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      {employee.presentDays}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-center">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                      {employee.absentDays}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-right text-red-600">
                    C$ {employee.deductions.toFixed(2)}
                  </td>
                  <td className="py-3 text-sm text-right font-medium text-green-600">
                    C$ {employee.netSalary.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
