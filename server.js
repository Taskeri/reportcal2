// server.js - גרסה מעודכנת עם תמיכה בפרטי מוצר מופרדים, תאריך/שעה מופרדים, וסוג פעולה (ייצור/מכירה)

const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const SHEET_ID = "1K__FbFVkPrh8CTepQIeerOObxyC10U2qTuD7wopAMWU";

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// ✅ שליפת משתמשים (login)
app.get("/users", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "user!B2:D",
    });

    const rows = result.data.values || [];
    const users = rows.map(row => ({
      username: row[0],
      password: row[1],
      role: row[2] || "user"
    }));

    res.json(users);
  } catch (error) {
    console.error("⚠️ שגיאה ב־/users:", error.response?.data || error.message || error);
    res.status(500).send("שגיאה בשליפת משתמשים");
  }
});

// ✅ שליפת מוצרים מלשונית products
app.get("/products", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "products!A2:C",
    });

    const rows = result.data.values || [];
    const products = rows.map(row => ({
      name: row[0] || "",
      size: row[1] || "",
      color: row[2] || ""
    })).filter(p => p.name);

    res.json(products);
  } catch (error) {
    console.error("⚠️ שגיאה ב־/products:", error.response?.data || error.message || error);
    res.status(500).send("שגיאה בשליפת מוצרים");
  }
});

// ✅ שליחת דיווח ללשונית report עם שדות מופרדים וסוג פעולה
app.post("/submit-report", async (req, res) => {
  try {
    const { user, product, size, color, quantity, workers, note, type } = req.body;
    const now = new Date();
    const dateStr = now.toLocaleDateString("he-IL", { timeZone: "Asia/Jerusalem" });
    const timeStr = now.toLocaleTimeString("he-IL", { timeZone: "Asia/Jerusalem" });

    const row = [product, size, color, quantity, dateStr, timeStr, type || "", note || "", ...(workers || [])];

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "report!A2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [row],
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("⚠️ שגיאה ב־/submit-report:", error.response?.data || error.message || error);
    res.status(500).json({ success: false, message: "שגיאה בשליחת הדיווח" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server is running on port", PORT);
});
