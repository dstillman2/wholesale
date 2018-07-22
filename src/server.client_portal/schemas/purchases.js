import { fields } from '../lib/util.schemas';

function Purchases() {
  this.id = fields.number();
  this.product_id = fields.number();
  this.quantity = fields.number();
  this.discount = fields.number();
  this.price = fields.number();
  this.name = fields.string();

  this.created_at = fields.default();
  this.updated_at = fields.default();
}

export default Purchases;
