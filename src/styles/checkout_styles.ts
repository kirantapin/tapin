export const checkoutStyles = {
  container: "flex flex-col min-h-screen bg-gray-50",
  header: "bg-white shadow-sm",
  headerContent: "flex items-center justify-between p-4",
  backButton: "text-gray-600",
  headerTitle: "text-lg font-semibold",
  cartIcon: "text-gray-600",

  main: "flex-1 p-4",
  section: "mb-6",
  sectionTitle: "text-lg font-semibold mb-4",

  itemCard: "bg-white rounded-lg shadow-sm p-4 mb-4",
  itemHeader: "flex justify-between items-start mb-2",
  itemName: "font-medium",
  itemPrice: "text-gray-600",
  itemQuantity: "text-sm text-gray-500",

  quantityControls: "flex items-center gap-3 mt-2",
  quantityButton:
    "w-8 h-8 rounded-full bg-[#2A2F45] flex items-center justify-center text-white",
  quantityText: "mx-3",

  policyCard: "bg-[#2A2F45] text-white rounded-lg p-4 mb-4",
  policyTitle: "font-semibold text-lg",
  policyDescription: "text-sm text-gray-300 mt-1",

  footer: "bg-white shadow-lg p-4",
  footerContent: "max-w-lg mx-auto",
  totalRow: "flex justify-between items-center mb-4",
  totalLabel: "text-gray-600",
  totalAmount: "text-xl font-semibold",

  checkoutButton: "w-full bg-[#2A2F45] text-white py-3 rounded-lg font-medium",
  disabledButton:
    "w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium",

  modal:
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4",
  modalContent: "bg-white rounded-lg p-6 max-w-sm w-full",
  modalTitle: "text-xl font-semibold mb-4",
  modalText: "text-gray-600 mb-6",
  modalButton: "w-full bg-[#2A2F45] text-white py-2 rounded-lg font-medium",

  errorText: "text-red-500 text-sm mt-2",
  successText: "text-green-500 text-sm mt-2",

  pageContainer: "min-h-screen bg-white text-black p-6", // p-6 adds padding of 6 units (24px) to all sides
  pageTitle: "text-3xl font-bold margin-bottom-8", // mb-8 stands for margin-bottom with 8 units of spacing (32px)
  itemsContainer: "divide-y divide-gray-300", // mb-8 stands for margin-bottom with 8 units of spacing (32px)
  itemContainer: "flex justify-between items-center",
  itemInfo: "text-sm text-gray-600",

  summaryContainer: "space-y-2 mb-8 font-medium",
  summaryRow: "flex justify-between",
  summaryTotal: "flex justify-between text-xl font-bold",

  paymentContainer: "space-y-4",
  paymentIcon: "w-5 h-5 mr-2",
};
