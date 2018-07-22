import { fields } from '../lib/util.schemas';

function ProductCategories() {
  this.id = fields.number();
  this.field = fields.string();
  this.options = fields.string();

  this.created_at = fields.default();
  this.updated_at = fields.default();
}

export default ProductCategories;
