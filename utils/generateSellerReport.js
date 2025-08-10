import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export const generateSellerReport = async ({
  storeInfo,
  storeRating,
  salesSummary,
  ordersSummary,
  completedThisMonth,
  topProduct,
  lowStock,
  salesChartData
}) => {
  if (!storeInfo || !salesSummary) {
    Alert.alert("Error", "Dashboard data is not fully loaded.");
    return;
  }

  const safeNum = (val, decimals = 2) => {
    const n = Number(val);
    return isNaN(n) ? (decimals === 0 ? "0" : "0.00") : n.toFixed(decimals);
  };

  const ordersSummaryHtml = ordersSummary.length
    ? ordersSummary.map(
        ({ status, count }) =>
          `<li>${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}</li>`
      ).join("")
    : "<li>No orders found</li>";

  const lowStockHtml = lowStock.length
    ? lowStock.map(
        (item) =>
          `<li>${item.product_name} - <span style="color:${
            item.stock_quantity < 5 ? "red" : "orange"
          }">${item.stock_quantity}</span></li>`
      ).join("")
    : "<li>All products have sufficient stock</li>";

  const salesChartHtml = salesChartData.length
    ? salesChartData.map(
        ({ year_month, sales_count, revenue }) =>
          `<tr>
            <td>${year_month}</td>
            <td style="text-align:right;">${sales_count}</td>
            <td style="text-align:right;">$${safeNum(revenue)}</td>
          </tr>`
      ).join("")
    : `<tr><td colspan="3">No sales data</td></tr>`;

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h2 { color: #282932; margin-bottom: 6px; text-align: center;}
          h2 { color: #704F38; }
          h3 { border-bottom: 1px solid #704F38; padding-bottom: 4px; padding-bottom: 6px; color: #bb6b49; }
          ul { list-style-type: none; padding-left: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f9fafb; text-align: left; }
        </style>
      </head>
      <body>

      <h1>Craftify.</h1>
        <h2>Seller Dashboard Report</h2>

        <h3>Store Information</h3>
        <p><strong>Name:</strong> ${storeInfo.store_name}</p>
        <p><strong>Description:</strong> ${storeInfo.store_description || "No description"}</p>

        <h3>Store Rating</h3>
        <p>${safeNum(storeRating)} / 5</p>

        <h3>Sales Summary</h3>
        <p><strong>Sales This Month:</strong> ${salesSummary.total_sales_month || 0}</p>
        <p><strong>Revenue This Month:</strong> PKR ${safeNum(salesSummary.total_revenue_month)}</p>
        <p><strong>Total Sales (Lifetime):</strong> ${salesSummary.total_sales_lifetime || 0}</p>
        <p><strong>Total Revenue (Lifetime):</strong> PKR ${safeNum(salesSummary.total_revenue_lifetime)}</p>

        <h3>Orders Summary by Status</h3>
        <ul>${ordersSummaryHtml}</ul>

        <h3>Completed Orders This Month</h3>
        <p>${completedThisMonth}</p>

        <h3>Top Selling Product</h3>
        ${
          topProduct
            ? `<p><strong>Product Name:</strong> ${topProduct.product_name}</p>
               <p><strong>Total Sold:</strong> ${topProduct.total_quantity_sold}</p>`
            : "<p>No sales data available.</p>"
        }

        <h3>Low Stock Products (Less than 10)</h3>
        <ul>${lowStockHtml}</ul>

        <h3>Sales & Revenue (Last 6 Months)</h3>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Sales Count</th>
              <th>Revenue (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${salesChartHtml}
          </tbody>
        </table>

      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  } catch (err) {
    console.error("Error generating/sharing PDF:", err);
    Alert.alert("Error", "Failed to generate or share the report.");
  }
};
