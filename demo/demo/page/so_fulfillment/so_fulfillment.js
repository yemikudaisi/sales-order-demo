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
			console.log(page.sort_order)
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
									$.each(r.message, function (i, d) {
											$list.append('<div>' + d.name + ' - ' + d.transaction_date + ' - ' + d.customer_name + ' - ' + d.grand_total + '</div>');
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

    page.refresh();
}