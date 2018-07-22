import { fields } from '../lib/util.schemas';

function Products() {
  this.id = fields.number();

  this.name = fields.string();
  this.description = fields.string();
  this.price = fields.number();
  this.image_uploads = fields.default();
  this.categories = fields.default();
  this.pdf_uploads = fields.default();
  this.qty_sold = fields.number();
  this.total_orders = fields.number();
  this.inventory = fields.number();
  this.lead_time = fields.number();
  this.is_active_marketplace = fields.boolean();
  this.hasInventoryTracking = fields.boolean();
  this.isSellingOOS = fields.boolean();
  this.inventory = fields.number();
  this.created_at = fields.default();
  this.updated_at = fields.default();
}

export default Products;
