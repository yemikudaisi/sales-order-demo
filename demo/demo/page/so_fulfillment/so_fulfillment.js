frappe.pages['so-fulfillment'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Sales Order Fulfillment',
        single_column: true
    });
    page.start = 0;
    page.page_length = 20; // Number of records per page

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

    page.sort_by = "transaction_date"; // Default sort by field
    page.sort_order = "asc"; // Default sort order

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
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" class="select-all"></th>
                                    <th>${__('Order ID')}</th>
                                    <th>${__('Transaction Date')}</th>
                                    <th>${__('Customer Name')}</th>
                                    <th>${__('Grand Total')}</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    $.each(r.message, function (i, d) {
                        table += `
                            <tr>
                                <td><input type="checkbox" class="select-order" data-order-id="${d.name}"></td>
                                <td>${d.name}</td>
                                <td>${d.transaction_date}</td>
                                <td>${d.customer_name}</td>
                                <td>${d.grand_total}</td>
                            </tr>
                        `;
                    });
                    table += `</tbody></table>`;
                    $list.append(table);

                    // Add event listener for select all checkbox
                    $(page.wrapper).find('.select-all').on('change', function () {
                        var checked = $(this).is(':checked');
                        $(page.wrapper).find('.select-order').prop('checked', checked);
                    });
                }
            }
        });
    };

    // Add pagination controls
    $(page.wrapper).find('.page-content').append(`
        <div class="result-list"></div>
        <div class="pagination-controls">
            <button class="btn btn-default btn-prev">${__('Previous')}</button>
            <button class="btn btn-default btn-next">${__('Next')}</button>
        </div>
        <div class="primary-action">
            <button class="btn btn-primary btn-print-order-id">${__('Print Order ID')}</button>
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

		let printBtn = page.set_primary_action('Print Order ID', () => {
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
		})

    page.refresh();
}