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
        ['transaction_date','between', [from_date, to_date]],
    ]
    print(f'Filters: {filters}')
    
    sales_orders = frappe.get_list(
        'Sales Order',
        fields=['name', 'transaction_date', 'customer_name', 'grand_total', 'status'],
        filters=filters,
        order_by=f'{sort_by} {sort_order}',
        start=start,
        page_length=page_length
    )
    
    return sales_orders

@frappe.whitelist()
def get_sales_order_items(order_id):
    """
    Retrieve sales order items for a given sales order ID.

    Args:
      order_id (str): The ID of the sales order.

    Returns:
      list[dict]: A list of dictionaries, each containing the following keys:
        - item_code (str): The code of the item.
        - item_name (str): The name of the item.
        - qty (float): The quantity of the item ordered.
        - rate (float): The rate of the item.
        - amount (float): The total amount for the item.
    """
    query = """
        SELECT
            soi.item_code,
            i.item_name,
            soi.qty,
            soi.rate,
            soi.amount
        FROM
            `tabSales Order Item` soi
        JOIN
            `tabItem` i ON soi.item_code = i.name
        WHERE
            soi.parent = %s
    """
    items = frappe.db.sql(query, order_id, as_dict=True)
    return items