odoo.define('website_product_dynamic_carousel.website_front', function(require) {
    'use strict';

    var sAnimation = require('website.content.snippets.animation');

    function initialize_owl(el, autoplay = false, items = 2) {
        el.owlCarousel({
            items: items,
            navText: ['<span aria-label="Previous"></span>', '<span aria-label="Next"></span>'],
            margin: 25,
            dots: false,
            autoplay: autoplay,
            autoplayHoverPause: true,
            autoplayTimeout: 3000,
            nav: true,
            responsive: {
                0: {
                    items: 1,
                },
                481: {
                    items: 2,
                },
                768: {
                    items: 2,
                },
                1024: {
                    items: 4,
                },
                1280: {
                    items: items,
                },
                1600: {
                    items: items,
                }
            }
        });
    }

    function initialize_owl_1(el, autoplay = false, items = 4) {
        el.owlCarousel({
            items: items,
            navText: ['<span aria-label="Previous"></span>', '<span aria-label="Next"></span>'],
            margin: 25,
            dots: false,
            autoplay: autoplay,
            autoplayHoverPause: true,
            autoplayTimeout: 3000,
            nav: true,
            responsive: {
                0: {
                    items: 1,
                },
                481: {
                    items: 2,
                },
                768: {
                    items: 2,
                },
                1024: {
                    items: 4,
                },
                1200: {
                    items: items,
                }
            }
        });
    }

    function initialize_owl_multi(el, autoplay = false, items = 4) {
        el.owlCarousel({
            items: items,
            navText: ['<span aria-label="Previous"></span>', '<span aria-label="Next"></span>'],
            margin: 25,
            dots: false,
            autoplay: autoplay,
            autoplayHoverPause: true,
            autoplayTimeout: 3000,
            nav: true,
            responsive: {
                0: {
                    items: 1,
                },
                481: {
                    items: 2,
                },
                768: {
                    items: 3,
                },
                1024: {
                    items: 4,
                },
                1200: {
                    items: items,
                }
            }

        });
    }

    function initialize_owl_multi_vertic(el, items = 1) {
        el.owlCarousel({
            items: items,
            navText: ['<span aria-label="Previous"></span>', '<span aria-label="Next"></span>'],
            margin: 25,
            dots: false,
            nav: true,
            loop: false,
            responsive: {
                0: {
                    items: 1,
                },
                481: {
                    items: 1,
                },
                768: {
                    items: 1,
                },
                1024: {
                    items: 1,
                },
                1200: {
                    items: 1,
                }
            }

        });
    }

    function destory_owl(el) {
        if (el && el.data('owlCarousel')) {
            el.data('owlCarousel').destroy();
            el.find('.owl-stage-outer').children().unwrap();
            el.removeData();
        }
    }

    sAnimation.registry.product_slider_actions = sAnimation.Class.extend({
        selector: ".s_product_slider",
        disabledInEditableMode: false,
        start: function(editMode) {
            var self = this;
            if (self.editableMode) {
                self.$target.empty().append('<div class="container"><div class="seaction-head"><h2>' + self.$target.attr("data-collection_name") + '</h2></div></div>');
            }
            if (!self.editableMode) {
                $.get("/shop/get_product_snippet_content", {
                    'snippet_type': self.$target.attr('data-snippet_type') || '',
                    'collection_id': self.$target.attr('data-collection_id') || 0,
                    'snippet_layout': self.$target.attr('data-snippet_layout') || '',
                    'prod_name': self.$target.attr("data-prod-name") || '',
                    'prod_price': self.$target.attr("data-prod-price") || '',
                    'prod_cart': self.$target.attr("data-prod-cart") || '',
                    'prod_quick_view': self.$target.attr("data-prod-quick_view") || '',
                    'prod_rating': self.$target.attr("data-prod-rating") || '',
                    'prod_count': parseInt(self.$target.attr('data-prod-count')) || ''
                }).then(function(data) {
                    if (data) {
                        self.$target.empty().append(data);
                        var autoplay = self.$target.attr('data-prod-auto') || false;
                        autoplay = autoplay.toLowerCase() == 'true' ? true : false;
                        var items = parseInt(self.$target.attr('data-prod-count')) || 8;
                        if (self.$target.attr('data-snippet_layout') === 'slider' && self.$target.find('> .prod_slider').length === 1) {
                            initialize_owl_1(self.$target.find("> .prod_slider .tqt-pro-slide"), autoplay, items);
                        } else if (self.$target.attr('data-snippet_layout') === 'fw_slider' && self.$target.find('> .fw_prod_slider').length === 1) {
                            initialize_owl(self.$target.find("> .fw_prod_slider .tqt-pro-slide"), autoplay, items);
                        } else if (self.$target.attr('data-snippet_layout') === 'horiz_tab' && self.$target.find('> .h_tab_prod_snip').length === 1) {
                            self.$target.find('> .h_tab_prod_snip a[data-toggle="tab"]').on('shown.bs.tab', function() {
                                initialize_owl_multi(self.$target.find("> .h_tab_prod_snip .tab-content .active .multi_slider"), autoplay, items);
                            }).on('hide.bs.tab', function() {
                                destory_owl(self.$target.find("> .h_tab_prod_snip .tab-content .active .multi_slider"));
                            });
                            initialize_owl_multi(self.$target.find("> .h_tab_prod_snip .tab-content .active .multi_slider"), autoplay, items);
                        } else if (self.$target.attr('data-snippet_layout') === 'vertic_tab' && self.$target.find('> .v_tab_prod_snip').length === 1) {
                            self.$target.find('> .v_tab_prod_snip a[data-toggle="tab"]').on('shown.bs.tab', function() {
                                initialize_owl_multi_vertic(self.$target.find("> .v_tab_prod_snip .product_detail .multi_slider"), items);
                            }).on('hide.bs.tab', function() {
                                destory_owl(self.$target.find("> .v_tab_prod_snip .product_detail .multi_slider"));
                            });
                            initialize_owl_multi_vertic(self.$target.find("> .v_tab_prod_snip .product_detail .multi_slider"), items);
                        }
                    }
                });
            }
        }
    });

});