document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if (!username || !password) {
      errorMsg.textContent = "אנא מלא את כל השדות";
      return;
    }

    try {
      const res = await fetch("/users");
      const users = await res.json();

      const found = users.find(
        (u) => u.username === username && u.password === password
      );

      if (found) {
        sessionStorage.setItem("user", found.username);
        sessionStorage.setItem("role", found.role || "user");
        sessionStorage.setItem("loginTime", new Date().toLocaleString("he-IL"));

        // ניתוב לפי תפקיד או מחלקה
        const isProduction = found.role?.toLowerCase() === "ייצור";
        window.location.href = isProduction ? "report.html" : "report-out.html";
      } else {
        errorMsg.textContent = "שם משתמש או סיסמה שגויים";
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "שגיאה בגישה לשרת";
    }
  });
});
