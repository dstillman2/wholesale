import { fields } from '../lib/util.schemas';

function Marketplace() {
  this.id = fields.number();

  this.account_id = fields.number();

  this.payments_stripe_publishable_key = fields.string();
  this.payments_stripe_secret_key = fields.string();
  this.payments_has_bitcoin = fields.boolean();
  this.payments_has_credit_card = fields.boolean();
  this.payments_bitcoin_markup = fields.number();
  this.payments_credit_card_markup = fields.number();
  this.contact_form_email = fields.string();
  this.checkout_thank_you_message = fields.string();
  this.logo_path = fields.string();
  this.primary_category_id = fields.number();
  this.categories = fields.default();
  this.checkout_thank_you_message = fields.string();
  this.order_confirmation_email = fields.string();
  this.sendgrid_api_key = fields.string();
  this.automated_email = fields.string();
  this.domain = fields.string();

  this.created_at = fields.default();
  this.updated_at = fields.default();
}

export default Marketplace;
