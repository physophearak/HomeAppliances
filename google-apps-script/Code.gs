/**
 * Je Hour POS — Google Apps Script backend.
 *
 * Setup:
 * 1. Create a Google Sheet with two tabs named exactly "Products" and "Sales".
 * 2. Products tab header row (row 1): ID | NameEn | NameKm | Category | PriceUsd | Stock | ImageUrl | Sku | Emoji
 * 3. Sales tab header row (row 1):    Timestamp | ItemsJson | Total
 * 4. Extensions > Apps Script, paste this file in as Code.gs.
 * 5. Deploy > New deployment > Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 * 6. Copy the web app URL into the app's .env file as VITE_GAS_URL.
 */

const PRODUCTS_SHEET = 'Products';
const SALES_SHEET = 'Sales';

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function sheetToProducts(sheet) {
  const values = sheet.getDataRange().getValues();
  const [header, ...rows] = values;
  return rows
    .filter((r) => r[0] !== '' && r[0] != null)
    .map((r) => {
      const row = {};
      header.forEach((key, i) => (row[key] = r[i]));
      return {
        id: String(row.ID),
        nameEn: row.NameEn,
        nameKm: row.NameKm,
        category: row.Category,
        priceUsd: Number(row.PriceUsd),
        stock: Number(row.Stock),
        imageUrl: row.ImageUrl,
        sku: row.Sku,
        emoji: row.Emoji || '📦',
      };
    });
}

function findRowById(sheet, id) {
  const ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 0), 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // 1-indexed, +1 for header
  }
  return -1;
}

function doGet(e) {
  const action = e.parameter.action || 'products';
  if (action === 'products') {
    const sheet = getSheet(PRODUCTS_SHEET);
    return jsonResponse({ products: sheetToProducts(sheet) });
  }
  return jsonResponse({ error: 'Unknown action' });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;

  if (action === 'sale') {
    return handleSale(body);
  }
  if (action === 'updateStock') {
    return handleUpdateStock(body);
  }
  if (action === 'addProduct') {
    return handleAddProduct(body);
  }
  if (action === 'updateProduct') {
    return handleUpdateProduct(body);
  }
  return jsonResponse({ ok: false, error: 'Unknown action' });
}

function handleSale(body) {
  const salesSheet = getSheet(SALES_SHEET);
  salesSheet.appendRow([
    body.timestamp || new Date().toISOString(),
    JSON.stringify(body.items || []),
    body.total || 0,
  ]);

  const productsSheet = getSheet(PRODUCTS_SHEET);
  (body.items || []).forEach((item) => {
    const rowIndex = findRowById(productsSheet, item.id);
    if (rowIndex === -1) return;
    const stockCell = productsSheet.getRange(rowIndex, 6); // column F = Stock
    const currentStock = Number(stockCell.getValue()) || 0;
    stockCell.setValue(Math.max(0, currentStock - Number(item.qty || 0)));
  });

  return jsonResponse({ ok: true });
}

function handleUpdateStock(body) {
  const productsSheet = getSheet(PRODUCTS_SHEET);
  const rowIndex = findRowById(productsSheet, body.id);
  if (rowIndex === -1) return jsonResponse({ ok: false, error: 'Product not found' });
  productsSheet.getRange(rowIndex, 6).setValue(Number(body.stock) || 0);
  return jsonResponse({ ok: true });
}

function handleAddProduct(body) {
  const productsSheet = getSheet(PRODUCTS_SHEET);
  const id = body.id || `P${new Date().getTime()}`;
  productsSheet.appendRow([
    id,
    body.nameEn || '',
    body.nameKm || '',
    body.category || 'kitchen',
    Number(body.priceUsd) || 0,
    Number(body.stock) || 0,
    body.imageUrl || '',
    body.sku || '',
    body.emoji || '📦',
  ]);
  return jsonResponse({
    ok: true,
    product: {
      id,
      nameEn: body.nameEn,
      nameKm: body.nameKm,
      category: body.category,
      priceUsd: Number(body.priceUsd) || 0,
      stock: Number(body.stock) || 0,
      imageUrl: body.imageUrl || '',
      sku: body.sku || '',
      emoji: body.emoji || '📦',
    },
  });
}

function handleUpdateProduct(body) {
  const productsSheet = getSheet(PRODUCTS_SHEET);
  const rowIndex = findRowById(productsSheet, body.id);
  if (rowIndex === -1) return jsonResponse({ ok: false, error: 'Product not found' });
  productsSheet
    .getRange(rowIndex, 1, 1, 9)
    .setValues([
      [
        body.id,
        body.nameEn || '',
        body.nameKm || '',
        body.category || 'kitchen',
        Number(body.priceUsd) || 0,
        Number(body.stock) || 0,
        body.imageUrl || '',
        body.sku || '',
        body.emoji || '📦',
      ],
    ]);
  return jsonResponse({
    ok: true,
    product: {
      id: body.id,
      nameEn: body.nameEn,
      nameKm: body.nameKm,
      category: body.category,
      priceUsd: Number(body.priceUsd) || 0,
      stock: Number(body.stock) || 0,
      imageUrl: body.imageUrl || '',
      sku: body.sku || '',
      emoji: body.emoji || '📦',
    },
  });
}
