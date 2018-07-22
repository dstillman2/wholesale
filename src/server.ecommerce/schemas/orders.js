import { fields } from '../lib/util.schemas';

function Orders() {
  this.id = fields.number();
  this.customer_id = fields.number();

  this.cdd = fields.default();
  this.ship_by_date = fields.default();

  this.payment_type = fields.string();
  this.order_status = fields.string();

  this.first_name = fields.string();
  this.last_name = fields.string();
  this.company = fields.string();

  this.billing_address_1 = fields.string();
  this.billing_address_2 = fields.string();
  this.billing_city = fields.string();
  this.billing_state = fields.string();
  this.billing_zip_code = fields.string();

  this.shipping_address_1 = fields.string();
  this.shipping_address_2 = fields.string();
  this.shipping_city = fields.string();
  this.shipping_state = fields.string();
  this.shipping_zip_code = fields.string();

  this.price_sub_total = fields.number();
  this.price_payment_markup = fields.number();
  this.price_delivery_fee = fields.number();
  this.price_discount_percentage = fields.number();
  this.price_discount_fixed = fields.number();
  this.price_total = fields.number();
  this.amount_paid = fields.number();

  this.email_address = fields.string();
  this.phone_number = fields.string();

  this.payment_type = fields.string();
  this.order_status = fields.string();

  this.created_at = fields.default();
  this.updated_at = fields.default();
}

export default Orders;
