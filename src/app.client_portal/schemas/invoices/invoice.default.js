import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function calculatePrice(items) {
  return items.reduce((totalSum, item) => (
    totalSum + (item.price * item.quantity)
  ), 0);
}

function createInvoice({ order, account, products }) {
  const date = moment(order.created_at).format('LL');
  const items = JSON.parse(products);
  const totalPrice = calculatePrice(items);
  const columns = ['#', 'Product', 'Quantity', 'Price per item'];
  const rows = [];

  items.forEach((item, index) => {
    rows.push(
      [
        index + 1,
        item.name,
        item.quantity,
        `$${(item.price / 100).toFixed(2)}`,
      ],
    );
  });

  rows.push(['Total', '', '', `$${(totalPrice / 100).toFixed(2)}`]);

  const doc = new jsPDF('1', 'pt', 'letter');

  doc.setFontSize(10);

  doc.setFontType('bold');
  doc.text(`${account.company}`, 40, 115);
  doc.setFontType('normal');
  doc.text(`${account.address_1} ${account.address_2 || ''}`, 40, 130);
  doc.text(`${account.city}, ${account.state} ${account.zip_code}`, 40, 145);

  doc.text(date, 40, 160);

  doc.autoTable(columns, rows, {
    theme: 'striped',
    margin: { top: 250 },
    halign: 'center',
    valign: 'center',
    lineColor: 200,
  });

  doc.setFontType('bold');
  doc.text('Delivery Address', 40, 635);
  doc.setFontType('normal');

  doc.text(`${order.first_name} ${order.last_name}`, 40, 650);
  doc.text(`${order.shipping_address_1} ${order.shipping_address_2 || ''}`, 40, 665);
  doc.text(`${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip_code}`, 40, 680);


  return {
    download() {
      return doc.save('invoice.pdf');
    },
  };
}

export default createInvoice;
