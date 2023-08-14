import { create } from 'apisauce';

const api = create({
    baseURL: "https://api-ojtsti2023inventory.nmscreative.com",
    withCredentials: true,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

//throttle
const THROTTLE_INTERVAL = 1500;
let lastRequestTime = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const throttledRequest = async (requestFunction, ...params) => {
  const now = Date.now();
  const elapsedTime = now - lastRequestTime;
  if (elapsedTime < THROTTLE_INTERVAL) {
    await delay(THROTTLE_INTERVAL - elapsedTime);
  }
  const response = await requestFunction(...params);
  lastRequestTime = Date.now();

  return response;
};

// Login
export const login = async (values, callback) => callback(await api.post("/api/login", values));

// Logout
export const logout = async () => await api.post("/api/logout");

// Dashboard HTTP requests
export const fetchItemsOnStock = async () =>{
  return throttledRequest(api.get, '/api/dashboard/items/on-stock');
}
export const fetchItemsOutOfStock = async () =>{
  return throttledRequest(api.get, '/api/dashboard/items/out-of-stock');
}
export const fetchPendingRequests = async () =>{
  return throttledRequest(api.get, '/api/dashboard/purchase/pending');
}
export const fetchApprovedOrders = async () =>{
  return throttledRequest(api.get, '/api/dashboard/purchase/approved');
}
export const fetchWeeklySpendings  = async () =>{
  return throttledRequest(api.get, '/api/category/weekly/cost');
}
export const fetchMonthlySpendings = async () =>{
  return throttledRequest(api.get, '/api/category/monthly/cost');
}
export const fetchAnnualSpendings = async () =>{
  return throttledRequest(api.get, '/api/category/annualy/cost');
}
export const fetchLineChartData = async (params) =>{
  return throttledRequest(api.get, '/api/dashboard/linechart-data', params);
}

// Items HTTP requests
export const fetchItemsList = async (params) =>{
  return throttledRequest(api.get, `/api/item-list?${params.toString()}`);
}
export const fetchCategoriesList = async () =>{
  return throttledRequest(api.get, '/api/categories-list');
}
export const fetchSubCategoriesList = async (category) =>{
  return throttledRequest(api.get, `/api/sub-categories-list?category=${category}`);
}
export const updateSingleItem = async () =>{
  return throttledRequest(api.get, '/api/items/items/use');
}
export const updateMultipleItems = async (values) =>{
  return throttledRequest(api.put, '/api/items/quantity/multiple', values);
}
export const fetchItemsForPurchase = async (values) =>{
  return throttledRequest(api.get, `/api/items-list/for-purchase?categoryId=${values}`);
}
export const updateItemQuantity = async (values) =>{
  return throttledRequest(api.put, '/api/items/quantity', values);
}
export const fetchReportsList = async (params) =>{
  return throttledRequest(api.get, `/api/logs-list?${params.toString()}`);
}
export const updateItemDetails = async (values) =>{
  return throttledRequest(api.put, '/api/items/update', values);
}

// Categories
export const fetchCategoryAndSubcategory = async (params) =>{
  return throttledRequest(api.get, `/api/category/get?${params.toString()}`, params);
}
export const createCategory = async (values) =>{
  return throttledRequest(api.post, '/api/category/create', values);
}
export const fetchCategory = async () =>{
  return throttledRequest(api.get, '/api/category');
}
export const updateCategorySubCategory = async (values) =>{
  return throttledRequest(api.put, '/api/category/subcategory/update', values);
}
export const fetchCategoryForRepurchase = async (id) =>{
  return throttledRequest(api.get, `/api/sub-categories-list/for-repurchase?categoryId=${id}`);
}

// Units
export const fetchUnit = async (params) =>{
  return throttledRequest(api.get, `/api/units?${params.toString()}`);
}
export const fetchUnitsForPurchase = async () =>{
  return throttledRequest(api.get, '/api/units-list/for-purchase');
}
export const createUnit = async ( name, unit_abbreviation) =>{
  return throttledRequest(api.post, '/api/units/create',  name, unit_abbreviation);
}
export const updateUnit = async (id, name, unit_abbreviation) =>{
  return throttledRequest(api.put, '/api/units/update', id, name, unit_abbreviation);
}
export const fetchUnitsforItems = async () =>{
  return throttledRequest(api.get, '/api/units/get');
}

// Requests
export const fetchPurchaseRequests = async (params) =>{
  return throttledRequest(api.get, `/api/purchase-requests?${params.toString()}`);
}
export const createPurchaseRequest = async (purchases) =>{
  return throttledRequest(api.post, '/api/create-purchase-request', purchases);
}
export const fetchPurchasesForRequests = async (purchaseId) =>{
  return throttledRequest(api.get, `/api/purchase-list/for-purchase/${purchaseId}`, purchaseId);
}
export const updatePurchaseRequest = async (values) =>{
  return throttledRequest(api.put, '/api/update-purchase-request', values);
}
export const rejectPurchaseRequest = async (values) =>{
  return throttledRequest(api.put, '/api/reject-purchase-request', values);
}

//Orders
export const fetchPurchaseOrders = async (params) =>{
  return throttledRequest(api.get, `/api/purchase-orders?${params.toString()}`);
}
export const fetchPurchaseOrderById = async (purchaseId) => {
  return throttledRequest(api.get, `/api/purchase-list/for-purchase-order/${purchaseId}`);
}
export const fetchPurchaseOrderList = async (purchaseId) => {
  return throttledRequest(api.get, `/api/purchase-list/purchase-order/${purchaseId}`);
}
export const fetchReceiptForOrders = async (purchaseId) => {
  return throttledRequest(api.get, `/api/receipt-list/purchase-order/${purchaseId}`);
}
export const updatePurchaseOrder = async (values) => {
  return throttledRequest(api.put, '/api/update-purchase-order', values);
}
export const cancelPurchaseOrder = async (values) => {
  return throttledRequest(api.put, '/api/cancel-purchase-order', values);
}

// Password HTTP request
export const forgotPassword = async (email) => {
  return throttledRequest(api.post, '/api/password/forgot', email);
}
export const resetPassword = async (token, email, password, confirmPassword) => {
  return throttledRequest(api.post, '/api/password/reset', token, email, password, confirmPassword);
}

// Users HTTP request
export const getUser = async () => {
  return throttledRequest(api.get, '/api/user');
}
export const getUserTheme = async (theme) => {
  return throttledRequest(api.put, '/api/user/theme', theme);
}
export const fetchUsers = async (params) => {
  return throttledRequest(api.get, `/api/user/list?${params.toString()}`);
}
export const createUsers = async (values) => {
  return throttledRequest(api.post, '/api/user/create', values);
}
export const editUsers = async (values) => {
  return throttledRequest(api.put, '/api/user/edit', values);
}
export const editUserProfile = async (userDetails, passwordDetails) => {
  return throttledRequest(api.put, "/api/user/update", userDetails, passwordDetails);
}
export const deactivateUser = async (id) => {
  return throttledRequest(api.post, '/api/user/deactivate', id);
}
export const reactivateUser = async (id) => {
  return throttledRequest(api.post, '/api/user/reactivate', id);
}

// Permissions HTTP request
export const fetchRoleWithPermissions = async () => {
  return throttledRequest(api.get, '/api/spatie/roles-and-permissions');
}
export const fetchRoles = async () => {
  return throttledRequest(api.get, '/api/spatie/roles');
}
export const fetchPermissions = async () => {
  return throttledRequest(api.get, '/api/spatie/permissions');
}
export const createRole = async (values) => {
  return throttledRequest(api.post, '/api/spatie/roles/create', values);
}
export const createPermission = async (values) => {
  return throttledRequest(api.post, '/api/spatie/permissions/create', values);
}
export const insertPermission = async (role, permission) =>{
  return throttledRequest(api.post, '/api/spatie/permissions/insert', role, permission);
}
export const revokePermission = async (role, permission) =>{
  return throttledRequest(api.post, '/api/spatie/permissions/revoke', role, permission);
}
// Router HTTP request
export const checkPermission = async (permission) =>{
  return throttledRequest(api.get, '/api/spatie/permissions/check', permission)
}

export default api;

