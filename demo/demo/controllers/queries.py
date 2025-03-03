import frappe
from frappe import _

@frappe.whitelist()
def get_sales_orders(from_date, to_date, sort_by, sort_order, start, page_length):
    """
    Retrieve a list of sales orders filtered by date range and status, and sorted by specified criteria.
    Args:
      from_date (str): The start date for filtering sales orders (inclusive).
      to_date (str): The end date for filtering sales orders (inclusive).
      sort_by (str): The field by which to sort the sales orders.
      sort_order (str): The order in which to sort the sales orders ('asc' for ascending, 'desc' for descending).
      start (int): The starting index for pagination.
      page_length (int): The number of sales orders to retrieve per page.
    Returns:
      list: A list of dictionaries, each representing a sales order with fields 'name', 'transaction_date', 'customer_name', 'grand_total', and 'status'.
    """
    filters = [
        ['docstatus', '=', 1],  # Submitted documents
        ['status', '!=', 'Completed'],
        ['transaction_date', '>=', from_date],
        ['transaction_date', '<=', to_date]
    ]
    
    sales_orders = frappe.get_list(
        'Sales Order',
        fields=['name', 'transaction_date', 'customer_name', 'grand_total', 'status'],
        filters=filters,
        order_by=f'{sort_by} {sort_order}',
        start=start,
        page_length=page_length
    )
    
    return sales_orders