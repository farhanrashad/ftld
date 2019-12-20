# -*- coding: utf-8 -*-
# Part of Atharva System. See LICENSE file for full copyright and licensing details.

from odoo import models, fields


class Multitab_configure(models.Model):
    _name = 'multitab.configure'
    _description = 'Tab configuration for product snippets'

    name = fields.Char("Group Name", required=True, translate=True)
    product_ids = fields.One2many("tab.products", "tab_id", string="Products")
    active = fields.Boolean("Active", default=True)
    image = fields.Binary(string="Image", store=True)
    image_filename = fields.Char(string='Image Filename')


class Tab_collection_product(models.Model):
    _name = "tab.products"
    _order = "sequence asc,id"
    _description = 'Product collection for tabs'

    product_id = fields.Many2one("product.template", string="Products",
                                 domain=[('website_published', '=', True)])
    sequence = fields.Integer(string="Sequence")
    tab_id = fields.Many2one("multitab.configure", string="Tab Id")


class Collection_configure(models.Model):
    _name = 'collection.configure'
    _description = 'Tab collections'

    name = fields.Char("Title", required=True ,translate=True)
    tab_collection_ids = fields.Many2many(
        'multitab.configure', string="Select Collection")
    active = fields.Boolean("Active", default=True)


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    tab_ids = fields.One2many(
        'tab.products', 'product_id', string='Product Tabs')
