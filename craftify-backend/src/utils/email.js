const transporter = require('./emailTransporter');

const formatOptions = (optionsJson) => {
  if (!optionsJson || typeof optionsJson !== 'object') return '';
  
  return Object.entries(optionsJson)
    .map(([key, value]) => `<br><small><strong>${key}:</strong> ${value}</small>`)
    .join('');
};

const sendOrderPlacedEmail = async (to, { order_id, customer_name, total_amount, items }) => {
  const itemListHtml = items.map(item => {
    const options = formatOptions(item.selected_options);
    return `<li>
              ${item.product_name || 'Unnamed Product'} - 
              Quantity: ${item.quantity} - 
              Price: PKR ${item.price}
              ${options}
            </li>`;
  }).join('');

  const html = `
    <h3>Thank you for your order, ${customer_name}!</h3>
    <p>Your order <strong>#${order_id}</strong> has been placed successfully.</p>
    <p><strong>Items:</strong></p>
    <ul>${itemListHtml}</ul>
    <p><strong>Total:</strong> $${total_amount.toFixed(2)}</p>
    <p>Please wait till the seller confirms the order. We’ll notify you once your order has been completed.</p>
  `;

  await transporter.sendMail({
    from: '"Craftify" <' + process.env.EMAIL + '>',
    to,
    subject: `Order Confirmation - #${order_id}`,
    html,
  });
};

const sendOrderCompletedEmail = async (to, { order_id, customer_name, total_amount, items }) => {
  const itemListHtml = items.map(item => {
    const options = formatOptions(item.selected_options);  // ✅ FIXED
    return `<li>
              ${item.product_name || 'Unnamed Product'} - 
              Quantity: ${item.quantity} - 
              Price: $${item.price}
              ${options}
            </li>`;
  }).join('');

  const html = `
    <h3>Your order #${order_id} is now complete 🎉</h3>
    <p>Thank you, ${customer_name}, for shopping with Craftify!</p>
    <p><strong>Items:</strong></p>
    <ul>${itemListHtml}</ul>
    <p><strong>Total Paid:</strong> $${total_amount.toFixed(2)}</p>
    <p>We hope you enjoyed your crafting journey!</p>
  `;

  await transporter.sendMail({
    from: '"Craftify" <' + process.env.EMAIL + '>',   // ✅ use env here too
    to,
    subject: `Order Completed - #${order_id}`,
    html,
  });
};


  module.exports = {
    sendOrderPlacedEmail,
    sendOrderCompletedEmail
  };
