frappe.pages['so-fulfillment'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Sales Order Fulfillment',
        single_column: true
    });
    page.start = 0;
    page.page_length = 20;

    page.from_field = page.add_field({
        fieldname: 'from_date',
        label: __('From Date'),
        fieldtype: 'Date',
        default: frappe.datetime.add_months(frappe.datetime.get_today(), -1),
    })

    page.to_field = page.add_field({
        fieldname: 'to_date',
        label: __('To Date'),
        fieldtype: 'Date',
        default: frappe.datetime.get_today(),
    })

    page.sort_by = "transaction_date";
    page.sort_order = "asc";

    page.sort_selector = new frappe.ui.SortSelector({
        parent: page.wrapper.find(".page-form"),
        args: {
            sort_by: "transaction_date",
            sort_order: "asc",
            options: [
                { fieldname: "transaction_date", label: __("Transaction Date") },
                { fieldname: "customer_name", label: __("Customer Name") },
                { fieldname: "grand_total", label: __("Grand Total") },
            ],
        },
        change: function (sort_by, sort_order) {
            sort_order = sort_order || "asc";
            console.log(sort_by, sort_order);
            page.sort_by = sort_by;
            page.sort_order = sort_order;
            page.start = 0;
            page.refresh();
        },
    });

    page.refresh = function () {
        frappe.call({
            method: 'demo.demo.controllers.queries.get_sales_orders',
            args: {
                from_date: page.from_field.get_value(),
                to_date: page.to_field.get_value(),
                sort_by: page.sort_by,
                sort_order: page.sort_order,
                start: page.start,
                page_length: page.page_length
            },
            callback: function (r) {
                var $list = $(page.wrapper).find('.result-list').empty();
                if (r.message) {
                    var table = `
                        <table class="table table-bordered horizontal-borders">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" class="select-all"></th>
                                    <th>${__('Order ID')}</th>
                                    <th>${__('Transaction Date')}</th>
                                    <th>${__('Customer Name')}</th>
                                    <th>${__('Grand Total')}</th>
                                    <th>${__('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    $.each(r.message, function (i, d) {
                        table += `
                            <tr data-order-id="${d.name}">
                                <td><input type="checkbox" class="select-order" data-order-id="${d.name}"></td>
                                <td>${d.name}</td>
                                <td>${d.transaction_date}</td>
                                <td>${d.customer_name}</td>
                                <td>${d.grand_total}</td>
                                <td><button class="btn btn-default btn-expand">${__('More')}</button></td>
                            </tr>
                            <tr class="order-items bg-gray-50" data-order-id="${d.name}" style="display: none;">
                                <td colspan="6">
                                    <div class="order-items-content" style="padding: 10px"></div>
                                </td>
                            </tr>
                        `;
                    });
                    table += `</tbody></table>`;
                    $list.append(table);

                    $(page.wrapper).find('.select-all').on('change', function () {
                        var checked = $(this).is(':checked');
                        $(page.wrapper).find('.select-order').prop('checked', checked);
                    });

                    $(page.wrapper).find('.btn-expand').on('click', function () {
                        var $btn = $(this);
                        var $orderRow = $btn.closest('tr');
                        var orderId = $orderRow.data('order-id');
                        var $itemsRow = $(page.wrapper).find(`.order-items[data-order-id="${orderId}"]`);
                        var $itemsContent = $itemsRow.find('.order-items-content');

                        if ($itemsRow.is(':visible')) {
                            $itemsRow.hide();
                            $btn.text(__('More'));
                        } else {
                            if ($itemsContent.is(':empty')) {
                                frappe.call({
                                    method: 'demo.demo.controllers.queries.get_sales_order_items',
                                    args: {
                                        order_id: orderId
                                    },
                                    callback: function (r) {
                                        if (r.message) {
                                            var itemsTable = `
                                                <table class="table table-bordered horizontal-borders">
                                                    <thead>
                                                        <tr>
                                                            <th>${__('Item Code')}</th>
                                                            <th>${__('Item Name')}</th>
                                                            <th>${__('Qty')}</th>
                                                            <th>${__('Rate')}</th>
                                                            <th>${__('Amount')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                            `;
                                            $.each(r.message, function (i, item) {
                                                itemsTable += `
                                                    <tr>
                                                        <td>${item.item_code}</td>
                                                        <td>${item.item_name}</td>
                                                        <td>${item.qty}</td>
                                                        <td>${item.rate}</td>
                                                        <td>${item.amount}</td>
                                                    </tr>
                                                `;
                                            });
                                            itemsTable += `</tbody></table>`;
                                            $itemsContent.append(itemsTable);
                                        }
                                    }
                                });
                            }
                            $itemsRow.show();
                            $btn.text(__('Less'));
                        }
                    });
                }
            }
        });
    };

    $(page.wrapper).find('.page-content').append(`
        <div class="result-list" style="padding: 5px"></div>
        <div class="list-paging-area level" style="padding: 5px 10px;">
            <div class="btn-group btn-group-paging">
                <button type="button" class="btn btn-default btn-sm btn-paging btn-info" data-value="20">20</button>
                <button type="button" class="btn btn-default btn-sm btn-paging" data-value="100">100</button>
                <button type="button" class="btn btn-default btn-sm btn-paging" data-value="500">500</button>
            </div>
            <div class="btn-group">
                <button class="btn btn-default btn-sm btn-prev">Prev</button>
                <button class="btn btn-default btn-sm btn-next">Next</button>
            </div>
        </div>
    `);

    $(page.wrapper).find('.btn-prev').on('click', function () {
        if (page.start > 0) {
            page.start -= page.page_length;
            page.refresh();
        }
    });

    $(page.wrapper).find('.btn-next').on('click', function () {
        page.start += page.page_length;
        page.refresh();
    });

    $(page.wrapper).find('.btn-paging').on('click', function () {
        var $btn = $(this);
        page.page_length = parseInt($btn.data('value'));
        page.start = 0;
        $(page.wrapper).find('.btn-paging').removeClass('btn-info');
        $btn.addClass('btn-info');
        page.refresh();
    });

    page.set_primary_action(__('Print Order ID'), function () {
        var selected_orders = [];
        $(page.wrapper).find('.select-order:checked').each(function () {
            selected_orders.push($(this).data('order-id'));
        });

        if (selected_orders.length > 0) {
            frappe.msgprint({
                title: __('Selected Order IDs'),
                message: selected_orders.join(', '),
                indicator: 'blue'
            });
        } else {
            frappe.msgprint({
                title: __('No Orders Selected'),
                message: __('Please select at least one order.'),
                indicator: 'red'
            });
        }
    });

    page.refresh();
}