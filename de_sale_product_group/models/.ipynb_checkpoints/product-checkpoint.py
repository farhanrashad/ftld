# -*- coding: utf-8 -*-

from odoo import models, fields, api

class ProductGroup(models.Model):
    _name = 'product.group'
    _description = 'Product Group'
    
    name = fields.Char(string="Group Name", required=True)
    
class Product(models.Model):
    _inherit = 'product.product'
    
    group_id = fields.Many2one('product.group', string='Product Group',store=True)