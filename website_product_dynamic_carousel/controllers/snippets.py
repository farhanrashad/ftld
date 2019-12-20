# -*- coding: utf-8 -*-
# Part of Atharva System. See LICENSE file for full copyright and licensing details.

from odoo import fields, http, _
from odoo.http import request
from werkzeug.exceptions import NotFound
from odoo.addons.website.controllers.main import QueryURL
from odoo.addons.http_routing.models.ir_http import slug
from odoo.addons.website_sale.controllers import main
from odoo.addons.website_sale.controllers.main import WebsiteSale
from odoo.addons.website_sale.controllers.main import TableCompute

main.PPG = 18
PPG = main.PPG


class WebsiteSaleSnippets(WebsiteSale):

    @http.route([
        '/shop',
        '/shop/page/<int:page>',
        '/shop/product_collection/<model("multitab.configure"):product_collection>',
        '/shop/product_collection/<model("multitab.configure"):product_collection>/page/<int:page>',
        '/shop/category/<model("product.public.category"):category>',
        '/shop/category/<model("product.public.category"):category>/page/<int:page>'],
        type='http', auth="public", website=True)
    def shop(self, page=0, category=None, product_collection=None, search='', ppg=False, **post):

        """ Inherit Shop Method for Product Collection """

        add_qty = int(post.get('add_qty', 1))
        Category = request.env['product.public.category']
        if category:
            category = Category.search([('id', '=', int(category))], limit=1)
            if not category or not category.can_access_from_current_website():
                raise NotFound()
        else:
            category = Category

        if ppg:
            try:
                ppg = int(ppg)
                post['ppg'] = ppg
            except ValueError:
                ppg = False
        if not ppg:
            ppg = request.env['website'].get_current_website().shop_ppg or 20

        ppr = request.env['website'].get_current_website().shop_ppr or 4

        attrib_list = request.httprequest.args.getlist('attrib')
        attrib_values = [[int(x) for x in v.split("-")] for v in attrib_list if v]
        attributes_ids = {v[0] for v in attrib_values}
        attrib_set = {v[1] for v in attrib_values}

        domain = self._get_search_domain(search, category, attrib_values)

        if product_collection or post.get('product_collection'):

            product_collection = request.env['multitab.configure'].browse(int(product_collection))

            if product_collection:
                domain += [('tab_ids.tab_id', '=', product_collection.id)]

        keep = QueryURL('/shop', category=category and int(category), search=search, attrib=attrib_list, order=post.get('order'))

        pricelist_context, pricelist = self._get_pricelist_context()

        request.context = dict(request.context, pricelist=pricelist.id, partner=request.env.user.partner_id)

        url = "/shop"
        if search:
            post["search"] = search
        if attrib_list:
            post['attrib'] = attrib_list

        Product = request.env['product.template'].with_context(bin_size=True)

        search_product = Product.search(domain)
        website_domain = request.website.website_domain()
        categs_domain = [('parent_id', '=', False)] + website_domain
        if search:
            search_categories = Category.search([('product_tmpl_ids', 'in', search_product.ids)] + website_domain).parents_and_self
            categs_domain.append(('id', 'in', search_categories.ids))
        else:
            search_categories = Category
        categs = Category.search(categs_domain)

        if category:
            url = "/shop/category/%s" % slug(category)

        product_count = len(search_product)
        pager = request.website.pager(url=url, total=product_count, page=page, step=ppg, scope=7, url_args=post)
        products = Product.search(domain, limit=ppg, offset=pager['offset'], order=self._get_search_order(post))

        ProductAttribute = request.env['product.attribute']
        if products:
            # get all products without limit
            attributes = ProductAttribute.search([('product_tmpl_ids', 'in', search_product.ids)])
        else:
            attributes = ProductAttribute.browse(attributes_ids)

        layout_mode = request.session.get('website_sale_shop_layout_mode')
        if not layout_mode:
            if request.website.viewref('website_sale.products_list_view').active:
                layout_mode = 'list'
            else:
                layout_mode = 'grid'

        values = {
            'search': search,
            'category': category,
            'attrib_values': attrib_values,
            'attrib_set': attrib_set,
            'pager': pager,
            'pricelist': pricelist,
            'add_qty': add_qty,
            'products': products,
            'search_count': product_count,  # common for all searchbox
            'bins': TableCompute().process(products, ppg, ppr),
            'ppg': ppg,
            'ppr': ppr,
            'categories': categs,
            'attributes': attributes,
            'keep': keep,
            'search_categories_ids': search_categories.ids,
            'layout_mode': layout_mode,
            'product_collection': post.get('product_collection')
        }
        if category:
            values['main_object'] = category
        return request.render("website_sale.products", values)

    @http.route('/get_prod_quick_view_details', type='json', auth='public', website=True)
    def get_product_qv_details(self, **kw):
        prod_id = None
        if 'prod_id' in kw:
            prod_id = http.request.env['product.template'].browse(int(kw.get('prod_id', 0)))
        return request.env.ref('website_product_dynamic_carousel.get_product_qv_details_template').render({
            'product': prod_id
        })

    def get_single_products_content(self, **post):
        values = {}
        if post.get('collection_id'):
            collection = request.env['multitab.configure'].browse(
                int(post.get('collection_id')))
            if collection:
                values.update({
                    'product_collection': collection,
                    'limit': post.get('limit') or 0,
                    'full_width': post.get('full_width')
                })
                if post.get('prod_cart') == 'true':
                    prod_cart = True
                    values.update({
                        'prod_cart': prod_cart
                    })
                if post.get('prod_price') == 'true':
                    prod_price = True
                    values.update({
                        'prod_price': prod_price
                    })
                if post.get('prod_name') == 'true':
                    prod_name = True
                    values.update({
                        'prod_name': prod_name
                    })
                if post.get('prod_rating') == 'true':
                    prod_rating = True
                    values.update({
                        'prod_rating': prod_rating
                    })
                if post.get('prod_quick_view') == 'true':
                    prod_quick_view = True
                    values.update({
                        'prod_quick_view': prod_quick_view
                    })
                if post.get('snippet_layout') == 'slider' or post.get('snippet_layout') == 'fw_slider':
                    return request.render("website_product_dynamic_carousel.product_slider_content", values)
                elif post.get('snippet_layout') == 'grid' or post.get('snippet_layout') == 'fw_grid':
                    return request.render("website_product_dynamic_carousel.latest_p_content", values)
                elif post.get('snippet_layout') == 'slider_img_left':
                    return request.render("website_product_dynamic_carousel.product_slider_2_content", values)
            return False

    def get_multi_tab_content(self, **post):
        value = {}
        pricelist_context = dict(request.env.context)
        pricelist = False
        prod_cart = False
        prod_price = False
        prod_name = False
        prod_rating = False
        prod_quick_view = False
        prod_count = ''

        if post.get('label'):
            value.update({
                'header': post.get('label')
            })
        if post.get('collection_id'):
            collection_data = request.env['collection.configure'].browse(
                int(post.get('collection_id')))
            value.update({
                'obj': collection_data
            })
            if post.get('prod_cart') == 'true':
                prod_cart = True
                value.update({
                    'prod_cart': prod_cart
                })
            if post.get('prod_price') == 'true':
                prod_price = True
                value.update({
                    'prod_price': prod_price
                })
            if post.get('prod_name') == 'true':
                prod_name = True
                value.update({
                    'prod_name': prod_name
                })
            if post.get('prod_rating') == 'true':
                prod_rating = True
                value.update({
                    'prod_rating': prod_rating
                })
            if post.get('prod_quick_view') == 'true':
                prod_quick_view = True
                value.update({
                    'prod_quick_view': prod_quick_view
                })
            prod_count = post.get('prod_count') or 1
            value.update({
                'prod_count': int(prod_count)
            })
            if post.get('snippet_layout') == 'horiz_tab':
                return request.render("website_product_dynamic_carousel.s_collection_configure", value)
            elif post.get('snippet_layout') == 'vertic_tab':
                return request.render("website_product_dynamic_carousel.product_tab_content", value)
        return False

    @http.route('/shop/get_product_snippet_content', type='http', auth='public', website=True)
    def get_product_snippet_content(self, **post):
        if post.get('snippet_type') and post.get('collection_id') and post.get('snippet_layout'):
            if post.get('snippet_type') == 'single':
                if post.get('snippet_layout') == 'fw_slider' or post.get('snippet_layout') == 'fw_grid':
                    post['full_width'] = True
                return self.get_single_products_content(**post)
            elif post.get('snippet_type') == 'multi':
                return self.get_multi_tab_content(**post)
        return False
