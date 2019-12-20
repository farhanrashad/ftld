odoo.define('website_product_dynamic_carousel.editor_js', function(require) {
    'use strict';

    var ajax = require('web.ajax');
    var core = require('web.core');
    var rpc = require('web.rpc');
    var weContext = require('web_editor.context');
    var web_editor = require('web_editor.editor');
    var options = require('web_editor.snippets.options');
    var wUtils = require('website.utils');
    var qweb = core.qweb;
    var _t = core._t;

    ajax.loadXML('/website_product_dynamic_carousel/static/src/xml/product_slider_popup.xml', core.qweb);

    options.registry.product_slider_actions = options.Class.extend({
        product_slider_configure: function(previewMode, value) {
            var self = this;
            if (previewMode === false || previewMode === "click") {
                self.$modal = $(qweb.render("website_product_dynamic_carousel.p_slider_popup_template"));
                $('body > #product_slider_modal').remove();
                self.$modal.appendTo('body');
                self._rpc({
                    model: 'multitab.configure',
                    method: 'name_search',
                    args: ['', []],
                    context: weContext.get()
                }).then(function(data) {
                    var s_tab_ele = $("#product_slider_modal select[name='s_tab_collection']");
                    s_tab_ele.empty();
                    var val_in_list_flag = true;
                    var val_in_list = false;
                    if (data) {
                        for (var i = 0; i < data.length; i++) {
                            s_tab_ele.append("<option value='" + data[i][0] + "'>" + data[i][1] + "</option>");
                            if (data[i][0].toString() === self.$target.attr("data-collection_id") && val_in_list_flag) {
                                val_in_list = true;
                                val_in_list_flag = false;
                            }
                        }
                        if (self.$target.attr("data-collection_id") !== "0" && val_in_list && self.$target.attr("data-snippet_type") === "single") {
                            s_tab_ele.val(self.$target.attr("data-collection_id"));
                        }
                    }
                    self._rpc({
                        model: 'collection.configure',
                        method: 'name_search',
                        args: ['', []],
                        context: weContext.get()
                    }).then(function(data) {
                        var m_tab_ele = $("#product_slider_modal select[name='m_tab_collection']");
                        m_tab_ele.empty();
                        val_in_list_flag = true;
                        val_in_list = false;
                        if (data) {
                            for (var i = 0; i < data.length; i++) {
                                m_tab_ele.append("<option value='" + data[i][0] + "'>" + data[i][1] + "</option>");
                                if (data[i][0].toString() === self.$target.attr("data-collection_id") && val_in_list_flag) {
                                    val_in_list = true;
                                    val_in_list_flag = false;
                                }
                            }
                            if (val_in_list && self.$target.attr("data-collection_id") !== "0" && val_in_list && self.$target.attr("data-snippet_type") === "multi") {
                                m_tab_ele.val(self.$target.attr("data-collection_id"));
                            }
                        }
                    });
                });
                self.$modal.on('change', self.$modal.find("select[name='slider_type']"), function() {
                    var $sel_ele = $(this).find("select[name='slider_type']");
                    var $form = $(this).find("form");
                    if ($sel_ele.val() === "single") {
                        $form.find(".s_tab_collection_container").show();
                        $form.find(".m_tab_collection_container").hide();

                    } else if ($sel_ele.val() === "multi") {
                        $form.find(".s_tab_collection_container").hide();
                        $form.find(".m_tab_collection_container").show();
                    }
                });
                self.$modal.on('change', self.$modal.find("select[name='s_tab_layout'],select[name='m_tab_layout']"), function(e) {
                    var $sel_ele;
                    var val_list = [];
                    if (self.$modal.find("select[name='slider_type']").val() === 'single')
                        $sel_ele = self.$modal.find("select[name='s_tab_layout']");
                    else if (self.$modal.find("select[name='slider_type']").val() === 'multi')
                        $sel_ele = self.$modal.find("select[name='m_tab_layout']");
                    else
                        return;
                    if($sel_ele.val() == 'slider' || $sel_ele.val() == 'fw_slider' || $sel_ele.val() == 'horiz_tab'){
                        self.$modal.find(".auto_load").show();
                        self.$modal.find(".prod_count").show();
                        self.$modal.find(".prod-name").show();
                        self.$modal.find(".prod-price").show();
                        self.$modal.find(".prod-cart").show();
                        self.$modal.find(".prod-quick_view").show();
                    }
                    else if($sel_ele.val() == 'slider' || $sel_ele.val() == 'fw_slider' || $sel_ele.val() == 'vertic_tab') {
                        self.$modal.find(".auto_load").hide();
                        self.$modal.find(".prod_count").show();
                        self.$modal.find(".prod-name").show();
                        self.$modal.find(".prod-price").show();
                        self.$modal.find(".prod-cart").show();
                        self.$modal.find(".prod-quick_view").show();
                    }
                    else {
                        self.$modal.find(".prod_count").hide();
                        self.$modal.find(".auto_load").hide();
                    }
                    self.$modal.find("form .p_slider_sample_view img.snip_sample_img").attr("src", "/website_product_dynamic_carousel/static/src/img/snippets/" + $sel_ele.val() + ".png");

                });
                // self.$modal.
                self.$modal.on('click', ".btn_apply", function() {
                    var $sel_ele = self.$modal.find("select[name='slider_type']");
                    var $form = self.$modal.find("form");
                    var $prod_auto = self.$modal.find("#prod-auto");
                    var $prod_count = self.$modal.find("#prod-count");
                    var $prod_name = self.$modal.find("#prod-name");
                    var $prod_price = self.$modal.find("#prod-price");
                    var $prod_cart = self.$modal.find("#prod-cart");
                    var $prod_quick_view = self.$modal.find("#prod-quick_view");
                    var $prod_rating = self.$modal.find("#prod-rating");

                    var collection_name = '';
                    var check = false;
                    var check_prod_name = false;
                    var check_prod_price = false;
                    var check_prod_cart = false;
                    var check_prod_quick_view = false;
                    var check_prod_rating = false;


                    // Check if true
                    if ($prod_auto.is(":checked") == true) {
                        check = true;
                    }

                    if ($prod_name.is(":checked") == true) {
                        check_prod_name = true;
                    }

                    if ($prod_price.is(":checked") == true) {
                        check_prod_price = true;
                    }

                    if ($prod_cart.is(":checked") == true) {
                        check_prod_cart = true;
                    }

                    if ($prod_quick_view.is(":checked") == true) {
                        check_prod_quick_view = true;
                    }

                    if ($prod_rating.is(":checked") == true) {
                        check_prod_rating = true;
                    }

                    if ($sel_ele.val() === "single") {
                        collection_name = $form.find("select[name='s_tab_collection'] option:selected").text();
                        if (!collection_name)
                            collection_name = "NO COLLECTION SELECTED";
                        self.$target.attr('data-snippet_type', $sel_ele.val());
                        self.$target.attr("data-collection_id", $form.find("select[name='s_tab_collection']").val());
                        self.$target.attr("data-collection_name", collection_name);
                        self.$target.attr("data-snippet_layout", $form.find("select[name='s_tab_layout']").val());
                        self.$target.attr("data-prod-auto", check);
                        self.$target.attr("data-prod-name", check_prod_name);
                        self.$target.attr("data-prod-price", check_prod_price);
                        self.$target.attr("data-prod-cart", check_prod_cart);
                        self.$target.attr("data-prod-quick_view", check_prod_quick_view);
                        self.$target.attr("data-prod-rating", check_prod_rating);
                        self.$target.attr("data-prod-count", $prod_count.val());

                    } else if ($sel_ele.val() === "multi") {

                        collection_name = $form.find("select[name='m_tab_collection'] option:selected").text();
                        if (!collection_name)
                            collection_name = "NO COLLECTION SELECTED";
                        self.$target.attr('data-snippet_type', $sel_ele.val());
                        self.$target.attr("data-collection_id", $form.find("select[name='m_tab_collection']").val());
                        self.$target.attr("data-collection_name", collection_name);
                        self.$target.attr("data-snippet_layout", $form.find("select[name='m_tab_layout']").val());
                        self.$target.attr("data-prod-auto", check);
                        self.$target.attr("data-prod-name", check_prod_name);
                        self.$target.attr("data-prod-price", check_prod_price);
                        self.$target.attr("data-prod-cart", check_prod_cart);
                        self.$target.attr("data-prod-quick_view", check_prod_quick_view);
                        self.$target.attr("data-prod-rating", check_prod_rating);
                        self.$target.attr("data-prod-count", $prod_count.val());
                    } else {
                        collection_name = 'NO COLLECTION SELECTED';
                    }
                    self.$target.empty().append('<div class="container"><div class="seaction-head"><h2>' + collection_name + '</h2></div></div>');
                });

                var sn_play;
                var sn_prod_name;
                var sn_prod_price;
                var sn_prod_cart;
                var sn_prod_quick_view;
                var sn_prod_rating;

                var sn_type = self.$target.attr("data-snippet_type");
                var sn_col = self.$target.attr("data-collection_id");
                var sn_layout = self.$target.attr("data-snippet_layout");
                var sn_count = self.$target.attr("data-prod-count");
                sn_play = self.$target.attr("data-prod-auto") || '';
                sn_prod_name = self.$target.attr("data-prod-name") || '';
                sn_prod_price = self.$target.attr("data-prod-price") || '';
                sn_prod_cart = self.$target.attr("data-prod-cart") || '';
                sn_prod_quick_view = self.$target.attr("data-prod-quick_view") || '';
                sn_prod_rating = self.$target.attr("data-prod-rating") || '';

                sn_play = sn_play.toLowerCase() == 'true' ? true : false;
                sn_prod_name = sn_prod_name.toLowerCase() == 'true' ? true : false;
                sn_prod_price = sn_prod_price.toLowerCase() == 'true' ? true : false;
                sn_prod_cart = sn_prod_cart.toLowerCase() == 'true' ? true : false;
                sn_prod_quick_view = sn_prod_quick_view.toLowerCase() == 'true' ? true : false;
                sn_prod_rating = sn_prod_rating.toLowerCase() == 'true' ? true : false;
                $('#prod-auto').prop('checked', sn_play);
                $('#prod-name').prop('checked', sn_prod_name);
                $('#prod-price').prop('checked', sn_prod_price);
                $('#prod-cart').prop('checked', sn_prod_cart);
                $('#prod-quick_view').prop('checked', sn_prod_quick_view);
                $('#prod-rating').prop('checked', sn_prod_rating);

                if (sn_type !== "0" && sn_layout !== "0" && sn_col !== "0") {
                    self.$modal.find("form select[name='slider_type']").val(sn_type);
                    if (self.$target.attr("data-snippet_type") === "single") {
                        self.$modal.find("form select[name='s_tab_layout']").val(sn_layout);
                    } else if (self.$target.attr("data-snippet_type") === "multi") {
                        self.$modal.find("form select[name='m_tab_layout']").val(sn_layout);
                    }
                }

                // Set Count in Modify
                if (sn_count !== "0") {
                    self.$modal.find("form input[name='prod-count']").val(sn_count);
                }
                self.$modal.find("select[name='slider_type']").trigger("change");
                self.$modal.modal();
            }
            return self;
        },
        onBuilt: function() {
            var self = this;
            this._super();
            this.product_slider_configure('click');
        }
    });

});