/*! DataTables Bulma integration
 * ©2011-2017 SpryMedia Ltd - datatables.net/license
 */

/**
 * DataTables integration for Bulma. This requires Bulma and
 * DataTables 1.10 or newer.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
 * for further information.
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net'], function ($) {
            return factory($, window, document);
        });
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = function (root, $) {
            if (!root) {
                root = window;
            }

            if (!$ || !$.fn.dataTable) {
                // Require DataTables, which attaches to jQuery, including
                // jQuery if needed and have a $ property so we can access the
                // jQuery object that is used
                $ = require('datatables.net')(root, $).$;
            }

            return factory($, root, root.document);
        };
    } else {
        // Browser
        factory(jQuery, window, document);
    }
}(function ($, window, document, undefined) {
    'use strict';

    var DataTable = $.fn.dataTable;

    /* Set the defaults for DataTables initialisation */
    $.extend(true, DataTable.defaults, {
        dom: "<'columns'<'column is-6'l><'column is-6'f>><'columns'<'column is-12'tr>><'columns'<'column info is-5'i><'column is-7'p>>",
        renderer: 'bulma'
    });

    /* Default class modification */
    $.extend(DataTable.ext.classes, {
        sFilter: 'dataTables_filter field',
        sFilterInput: 'input is-small',
        sLength: 'dataTables_length field',
        sPageButton: 'pagination-link',
        sPageButtonActive: 'is-current',
        sPageButtonNext: 'pagination-next',
        sPageButtonPrevious: 'pagination-previous',
        sPageEllipsis: 'pagination-ellipsis',
        sPaging: 'pagination dataTables_paginate paging_',
        sWrapper: 'dataTables_wrapper dt-bulma'
    });

    /* Bulma paging button renderer */
    DataTable.ext.renderer.pageButton.bulma = function (settings, host, idx, buttons, page, pages) {
        var api = new DataTable.Api(settings);
        var classes = settings.oClasses;
        var lang = settings.oLanguage.oPaginate;
        var aria = settings.oLanguage.oAria.paginate || {};
        var btnDisplay, btnClass, counter = 0;

        var attach = function (container, buttons) {
            var i, ien, node, button, isDisabled = false;
            var clickHandler = function (e) {
                e.preventDefault();

                if (!$(e.currentTarget).is('disabled') && api.page() != e.data.action) {
                    api.page(e.data.action).draw('page');
                }
            };

            for (i = 0, ien = buttons.length; i < ien; i++) {
                button = buttons[i];

                if ($.isArray(button)) {
                    attach(container, button);
                } else {
                    btnDisplay = null;
                    btnClass = '';

                    switch (button) {
                        case 'ellipsis':
                            $('<li>')
                                .append('<span class="' + classes.sPageEllipsis + '">&hellip;</span>')
                                .appendTo(container);
                            break;

                        case 'first':
                            btnDisplay = lang.sFirst;
                            isDisabled = page > 0 ? false : true;
                            break;

                        case 'previous':
                            btnDisplay = lang.sPrevious;
                            btnClass = classes.sPageButtonPrevious;
                            isDisabled = page > 0 ? false : true;
                            break;

                        case 'next':
                            btnDisplay = lang.sNext;
                            btnClass = classes.sPageButtonNext;
                            isDisabled = page < pages - 1 ? false : true;
                            break;

                        case 'last':
                            btnDisplay = lang.sLast;
                            isDisabled = page < pages - 1 ? false : true;
                            break;

                        default:
                            btnDisplay = button + 1;
                            btnClass = page === button ? ' ' + classes.sPageButtonActive : '';
                            break;
                    }

                    if (btnDisplay !== null) {
                        node = $('<li>')
                            .append($('<a>', {
                                'class': button !== 'previous' && button !== 'next' ? classes.sPageButton + btnClass : btnClass,
                                'aria-controls': settings.sTableId,
                                'aria-label': aria[button],
                                'data-dt-idx': counter,
                                'tabindex': settings.iTabIndex,
                                'id': idx === 0 && typeof button === 'string' ? settings.sTableId + '_' + button : null,
                                'disabled': isDisabled,
                            })
                            .html(btnDisplay))
                            .appendTo(container);

                        settings.oApi._fnBindAction(node.children('a'), {
                            action: button
                        }, clickHandler);

                        counter++;
                    }
                }
            }
        };

        // IE9 throws an 'unknown error' if document.activeElement is used
        // inside an iframe or frame. Try / catch the error. Not good for
        // accessibility, but neither are frames.
        var activeEl;

        try {
            // Because this approach is destroying and recreating the paging
            // elements, focus is lost on the select button which is bad for
            // accessibility. So we want to restore focus once the draw has
            // completed
            activeEl = $(host).find(document.activeElement).data('dt-idx');
        } catch (e) {}

        attach($(host).empty().html('<ul class="pagination-list"/>').children('ul'), buttons);

        if (activeEl !== undefined) {
            $(host).find('[data-dt-idx=' + activeEl + ']').focus();
        }
    }

    return DataTable;
}));
