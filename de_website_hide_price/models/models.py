# -*- coding: utf-8 -*-

from odoo import models, fields, api

class CrmLead(models.Model):
    _inherit = 'crm.lead'
    
    fname = fields.Char('First Name')
    lname = fields.Char('Last Name')
    
    business_type = fields.Selection([
        ('producer', 'Producer'),
        ('processor', 'Processor'),
        ('exporter', 'Exporter'),
        ('distributor', 'Distributor'),
        ('manufacturer', 'Manufacturer'),
        ('vendor', 'Vendor'),
    ], string='Business Type')
    
    country_state = fields.Char(string='State')