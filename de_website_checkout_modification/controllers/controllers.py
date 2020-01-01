# -*- coding: utf-8 -*-
# from odoo import http


# class DeWebsiteCheckoutModification(http.Controller):
#     @http.route('/de_website_checkout_modification/de_website_checkout_modification/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/de_website_checkout_modification/de_website_checkout_modification/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('de_website_checkout_modification.listing', {
#             'root': '/de_website_checkout_modification/de_website_checkout_modification',
#             'objects': http.request.env['de_website_checkout_modification.de_website_checkout_modification'].search([]),
#         })

#     @http.route('/de_website_checkout_modification/de_website_checkout_modification/objects/<model("de_website_checkout_modification.de_website_checkout_modification"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('de_website_checkout_modification.object', {
#             'object': obj
#         })
