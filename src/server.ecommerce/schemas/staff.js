import { fields } from '../lib/util.schemas';

function Staff() {
  this.id = fields.number();

  this.first_name = fields.string();
  this.last_name = fields.string();
  this.username = fields.string();
  this.permissions = fields.string();

  this.is_active = fields.boolean();

  this.created_at = fields.default();
  this.updated_at = fields.default();
}

export default Staff;
