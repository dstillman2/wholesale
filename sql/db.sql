# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Database: db1
# Generation Time: 2018-07-22 14:58:18 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table accounts
# ------------------------------------------------------------

DROP TABLE IF EXISTS `accounts`;

CREATE TABLE `accounts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `company` varchar(45) DEFAULT NULL,
  `subdomain` varchar(90) NOT NULL DEFAULT '',
  `domain` varchar(90) DEFAULT NULL,
  `address_1` varchar(150) DEFAULT NULL,
  `address_2` varchar(150) DEFAULT NULL,
  `city` varchar(90) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `zip_code` varchar(45) DEFAULT NULL,
  `phone_number` varchar(24) DEFAULT NULL,
  `email_address` varchar(120) DEFAULT NULL,
  `flags` text,
  `logo_path` varchar(90) DEFAULT NULL,
  `api_key` varchar(90) DEFAULT NULL,
  `qb_token` text,
  `qb_last_sync` datetime DEFAULT NULL,
  `qb_realm_id` varchar(45) DEFAULT NULL,
  `is_qb_enabled` tinyint(4) DEFAULT NULL,
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_sub` (`subdomain`),
  UNIQUE KEY `unique_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table activities
# ------------------------------------------------------------

DROP TABLE IF EXISTS `activities`;

CREATE TABLE `activities` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(45) DEFAULT NULL,
  `data` text,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table customers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) unsigned NOT NULL,
  `company` varchar(90) DEFAULT NULL,
  `first_name` varchar(90) DEFAULT NULL,
  `last_name` varchar(90) DEFAULT NULL,
  `address_1` varchar(120) DEFAULT NULL,
  `address_2` varchar(120) DEFAULT NULL,
  `email_address` varchar(120) DEFAULT NULL,
  `EIN` varchar(90) DEFAULT NULL,
  `qb_id` varchar(45) DEFAULT NULL,
  `qb_sync_token` varchar(45) DEFAULT NULL,
  `password` varchar(90) DEFAULT NULL,
  `city` varchar(90) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `zip_code` varchar(45) DEFAULT NULL,
  `phone_number` varchar(45) DEFAULT NULL,
  `is_active` tinyint(4) unsigned DEFAULT '1',
  `total_orders` int(11) DEFAULT '0',
  `total_revenue` int(11) DEFAULT '0',
  `discount` int(11) DEFAULT '0',
  `is_deleted` tinyint(4) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `customers_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table exceptions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `exceptions`;

CREATE TABLE `exceptions` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `task` varchar(90) DEFAULT NULL,
  `description` text,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table inventory_history
# ------------------------------------------------------------

DROP TABLE IF EXISTS `inventory_history`;

CREATE TABLE `inventory_history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table marketplace_settings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `marketplace_settings`;

CREATE TABLE `marketplace_settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) unsigned NOT NULL,
  `payments_stripe_publishable_key` varchar(90) DEFAULT NULL,
  `payments_stripe_secret_key` varchar(90) DEFAULT NULL,
  `payments_has_bitcoin` tinyint(4) NOT NULL DEFAULT '0',
  `payments_has_credit_card` tinyint(4) NOT NULL DEFAULT '1',
  `payments_credit_card_markup` float DEFAULT '0',
  `contact_form_email` varchar(120) DEFAULT NULL,
  `automated_email` varchar(120) DEFAULT NULL,
  `sendgrid_api_key` varchar(90) DEFAULT NULL,
  `domain` varchar(120) DEFAULT NULL,
  `order_confirmation_email` text,
  `logo_path` varchar(120) DEFAULT NULL,
  `checkout_thank_you_message` text,
  `primary_category_id` int(11) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table order_items
# ------------------------------------------------------------

DROP TABLE IF EXISTS `order_items`;

CREATE TABLE `order_items` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) unsigned NOT NULL,
  `order_id` int(11) unsigned NOT NULL,
  `product_id` int(11) unsigned DEFAULT NULL,
  `customer_id` int(11) unsigned DEFAULT NULL,
  `quantity` float DEFAULT NULL,
  `name` varchar(90) DEFAULT NULL,
  `price` int(11) unsigned DEFAULT NULL,
  `discount` int(11) unsigned DEFAULT '0',
  `qb_id` varchar(45) DEFAULT NULL,
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `customer_id` (`customer_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `order_items_ibfk_4` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table orders
# ------------------------------------------------------------

DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) unsigned NOT NULL,
  `customer_id` int(11) unsigned DEFAULT NULL,
  `cdd` int(11) DEFAULT NULL,
  `ship_by_date` datetime DEFAULT NULL,
  `payment_type` varchar(45) DEFAULT NULL,
  `price_sub_total` int(11) unsigned NOT NULL,
  `price_payment_markup` int(11) unsigned NOT NULL DEFAULT '0',
  `price_delivery_fee` int(11) unsigned NOT NULL DEFAULT '0',
  `price_discount_percentage` int(11) unsigned DEFAULT NULL,
  `price_discount_fixed` int(11) unsigned DEFAULT NULL,
  `price_total` int(11) unsigned NOT NULL,
  `amount_paid` int(11) unsigned NOT NULL,
  `order_status` varchar(45) NOT NULL DEFAULT '',
  `stripe_token_id` varchar(45) DEFAULT NULL,
  `company` varchar(90) DEFAULT '',
  `first_name` varchar(90) DEFAULT '',
  `last_name` varchar(90) DEFAULT '',
  `billing_address_1` varchar(90) DEFAULT NULL,
  `billing_address_2` varchar(90) DEFAULT NULL,
  `billing_city` varchar(90) DEFAULT NULL,
  `billing_state` varchar(45) DEFAULT NULL,
  `billing_zip_code` varchar(45) DEFAULT NULL,
  `shipping_address_1` varchar(90) NOT NULL DEFAULT '',
  `shipping_address_2` varchar(90) NOT NULL DEFAULT '',
  `shipping_city` varchar(90) NOT NULL DEFAULT '',
  `shipping_state` varchar(90) NOT NULL DEFAULT '',
  `shipping_zip_code` varchar(45) NOT NULL DEFAULT '',
  `email_address` varchar(90) DEFAULT NULL,
  `phone_number` varchar(90) DEFAULT NULL,
  `qb_id` varchar(45) DEFAULT NULL,
  `qb_sync_token` varchar(45) DEFAULT NULL,
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table product_categories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `product_categories`;

CREATE TABLE `product_categories` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) DEFAULT NULL,
  `field` varchar(45) DEFAULT NULL,
  `options` text,
  `is_deleted` tinyint(4) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table products
# ------------------------------------------------------------

DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `name` varchar(90) DEFAULT NULL,
  `description` text,
  `categories` json DEFAULT NULL,
  `lead_time` int(11) DEFAULT NULL,
  `image_uploads` text,
  `pdf_uploads` text,
  `inventory` float DEFAULT NULL,
  `hasInventoryTracking` tinyint(4) unsigned DEFAULT '0',
  `isSellingOOS` tinyint(4) unsigned DEFAULT '0',
  `qty_sold` int(11) unsigned NOT NULL DEFAULT '0',
  `total_orders` int(11) unsigned NOT NULL DEFAULT '0',
  `price` int(11) unsigned DEFAULT NULL,
  `is_active_marketplace` tinyint(4) unsigned NOT NULL DEFAULT '1',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `account_id` int(11) unsigned NOT NULL,
  `first_name` varchar(90) DEFAULT NULL,
  `last_name` varchar(90) DEFAULT NULL,
  `email_address` varchar(120) DEFAULT NULL,
  `username` varchar(120) DEFAULT NULL,
  `password` varchar(120) DEFAULT NULL,
  `permissions` text,
  `is_staff` tinyint(4) DEFAULT '0',
  `is_active` tinyint(4) DEFAULT '1',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
