import { fields } from '../lib/util.schemas';

function Accounts() {
  this.company = fields.string();
  this.address_1 = fields.string();
  this.address_2 = fields.string();
  this.city = fields.string();
  this.state = fields.string();
  this.zip_code = fields.string();
  this.phone_number = fields.string();
  this.email_address = fields.string();
  this.subdomain = fields.string();
  this.domain = fields.string();
  this.is_qb_enabled = fields.boolean();

  this.created_at = fields.default();
  this.updated_at = fields.default();
}

export default Accounts;
