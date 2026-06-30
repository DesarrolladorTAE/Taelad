import axiosClient from "../../../../services/axiosClient";

export const clicMenuService = {
  dashboard: (params?: any) =>
    axiosClient.get("/superadmin/clicmenu/dashboard", { params }),

  owners: (params?: any) =>
    axiosClient.get("/superadmin/clicmenu/owners", { params }),

  createOwner: (payload: any) =>
    axiosClient.post("/superadmin/clicmenu/owners", payload),

  showOwner: (ownerId: number) =>
    axiosClient.get(`/superadmin/clicmenu/owners/${ownerId}`),

  updateOwner: (ownerId: number, payload: any) =>
    axiosClient.put(`/superadmin/clicmenu/owners/${ownerId}`, payload),

  deleteOwner: (ownerId: number) =>
    axiosClient.delete(`/superadmin/clicmenu/owners/${ownerId}`),

  restaurants: (ownerId: number, params?: any) =>
    axiosClient.get(`/superadmin/clicmenu/owners/${ownerId}/restaurants`, {
      params,
    }),

  createRestaurant: (ownerId: number, payload: any) =>
    axiosClient.post(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants`,
      payload
    ),

  showRestaurant: (ownerId: number, restaurantId: number) =>
    axiosClient.get(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}`
    ),

  updateRestaurant: (
    ownerId: number,
    restaurantId: number,
    payload: any
  ) =>
    axiosClient.put(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}`,
      payload
    ),

  deleteRestaurant: (ownerId: number, restaurantId: number) =>
    axiosClient.delete(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}`
    ),

  branches: (ownerId: number, restaurantId: number, params?: any) =>
    axiosClient.get(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/branches`,
      { params }
    ),

  createBranch: (ownerId: number, restaurantId: number, payload: any) =>
    axiosClient.post(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/branches`,
      payload
    ),

  showBranch: (ownerId: number, restaurantId: number, branchId: number) =>
    axiosClient.get(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}`
    ),

  updateBranch: (
    ownerId: number,
    restaurantId: number,
    branchId: number,
    payload: any
  ) =>
    axiosClient.put(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}`,
      payload
    ),

  deleteBranch: (ownerId: number, restaurantId: number, branchId: number) =>
    axiosClient.delete(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}`
    ),

  currentSubscription: (ownerId: number, restaurantId: number) =>
    axiosClient.get(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/current`
    ),

  subscriptions: (ownerId: number, restaurantId: number) =>
    axiosClient.get(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/subscriptions`
    ),

  createSubscription: (
    ownerId: number,
    restaurantId: number,
    payload: any
  ) =>
    axiosClient.post(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/subscriptions`,
      payload
    ),

  expireCurrentSubscription: (ownerId: number, restaurantId: number) =>
    axiosClient.post(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/expire-current`
    ),

  monthlySales: (params?: any) =>
    axiosClient.get("/superadmin/clicmenu/subscription-sales/monthly", {
      params,
    }),

  salesSummary: (params?: any) =>
    axiosClient.get("/superadmin/clicmenu/subscription-sales/summary", {
      params,
    }),
};