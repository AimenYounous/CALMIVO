import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const EXCEL_FILE = path.join(__dirname, 'orders.csv');

// Create CSV with BOM for Excel UTF-8 Arabic support and headers if it doesn't exist
if (!fs.existsSync(EXCEL_FILE)) {
  fs.writeFileSync(EXCEL_FILE, '\uFEFFالتاريخ,الاسم الكامل,رقم الهاتف,المدينة,المنتج,السعر\n', 'utf8');
}

app.post('/api/order', (req, res) => {
  const { name, phone, city, packageTitle, price } = req.body;
  const timestamp = new Date().toLocaleString('ar-MA');
  
  const rawData = [timestamp, name, phone, city, packageTitle, price];
  const csvRow = rawData.map(item => `"${String(item || '').replace(/"/g, '""')}"`).join(',') + '\n';
  
  fs.appendFile(EXCEL_FILE, csvRow, 'utf8', (err) => {
    if (err) {
      console.error('Error saving order:', err);
      return res.status(500).json({ error: 'Failed to save order' });
    }
    console.log(`New Order Saved: ${name} - ${packageTitle}`);
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Order Server is running at http://localhost:${port}`);
  console.log(`All orders will be stored in Excel (CSV): ${EXCEL_FILE}`);
});
