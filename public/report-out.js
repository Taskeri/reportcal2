// report-out.js - קובץ מלא ותקין לדיווח מכירות עם עדכון עמודה G ל"מכירה"

document.addEventListener("DOMContentLoaded", async () => {
  const username = sessionStorage.getItem("user");
  if (!username) return (window.location.href = "/");

  document.getElementById("welcome").textContent = `שלום, ${username}`;

  const productSelect = document.getElementById("product");
  const sizeSelect = document.getElementById("size");
  const colorSelect = document.getElementById("color");
  const workersSelect = document.getElementById("workers");
  const quantityInput = document.getElementById("quantity");
  const noteInput = document.getElementById("note");
  const reportForm = document.getElementById("report-form");
  const messageDiv = document.getElementById("message");

  async function fetchProducts() {
    try {
      const res = await fetch("/products");
      const data = await res.json();

      const uniqueNames = [...new Set(data.map(p => p.name).filter(Boolean))];
      const uniqueSizes = [...new Set(data.map(p => p.size).filter(Boolean))];
      const uniqueColors = [...new Set(data.map(p => p.color).filter(Boolean))];

      productSelect.innerHTML = uniqueNames.map(p => `<option value="${p}">${p}</option>`).join("");
      sizeSelect.innerHTML = uniqueSizes.map(s => `<option value="${s}">${s}</option>`).join("");
      colorSelect.innerHTML = uniqueColors.map(c => `<option value="${c}">${c}</option>`).join("");
    } catch (err) {
      console.error("שגיאה בשליפת מוצרים:", err);
    }
  }

  async function fetchWorkers() {
    try {
      const res = await fetch("/users");
      const data = await res.json();

      workersSelect.innerHTML = data.map(w => {
        const selected = w.username === username ? "selected" : "";
        return `<option value="${w.username}" ${selected}>${w.username}</option>`;
      }).join("");
    } catch (err) {
      console.error("שגיאה בשליפת עובדים:", err);
    }
  }

  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const product = productSelect.value;
    const size = sizeSelect.value;
    const color = colorSelect.value;
    const quantity = quantityInput.value;
    const note = noteInput.value;
    const workers = Array.from(workersSelect.selectedOptions).map(opt => opt.value);

    if (!product || !size || !color || !quantity || workers.length === 0) {
      messageDiv.textContent = "אנא מלא את כל השדות";
      messageDiv.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/submit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: username,
          product,
          size,
          color,
          quantity: `-${quantity}`,
          workers,
          note,
          type: "מכירה"
        })
      });

      const result = await res.json();
      if (result.success) {
        messageDiv.textContent = "הדיווח נשלח בהצלחה!";
        messageDiv.style.color = "green";
        reportForm.reset();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("שגיאה בשליחה:", err);
      messageDiv.textContent = "שגיאה בשליחת הדיווח";
      messageDiv.style.color = "red";
    }
  });

  await fetchProducts();
  await fetchWorkers();
});
