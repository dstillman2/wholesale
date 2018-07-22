import { fields } from '../lib/util.schemas';

function Customers() {
  this.id = fields.number();

  this.company = fields.string();
  this.first_name = fields.string();
  this.last_name = fields.string();
  this.address_1 = fields.string();
  this.address_2 = fields.string();
  this.email_address = fields.string();
  this.EIN = fields.string();
  this.city = fields.string();
  this.state = fields.string();
  this.total_orders = fields.number();
  this.total_revenue = fields.number();
  this.zip_code = fields.string();
  this.phone_number = fields.string();
  this.is_active = fields.boolean();
  this.discount = fields.number();

  this.created_at = fields.default();
  this.updated_at = fields.default();
}

export default Customers;
