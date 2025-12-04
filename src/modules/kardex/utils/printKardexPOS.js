export default function printKardexPOS(movements = []) {
  const text = [];

  text.push("====== KARDEX ======");
  text.push(`Movimientos: ${movements.length}`);
  text.push("----------------------------");

  movements.forEach((m) => {
    text.push(
      `${new Date(m.created_at).toLocaleString()} | ${(m.movement_type || "").toUpperCase()} | QTY: ${m.qty}`
    );
  });

  text.push("----------------------------");
  text.push("FIN DEL KARDEX");

  const win = window.open("", "_blank");
  win.document.write(`<pre>${text.join("\n")}</pre>`);
  win.print();
  win.close();
}
