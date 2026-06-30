import axiosClient from "./axiosClient";

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

  branches: (ownerId: number, restaurantId: number, params?: any) =>
    axiosClient.get(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/branches`,
      { params }
    ),

  currentSubscription: (ownerId: number, restaurantId: number) =>
    axiosClient.get(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/current`
    ),

  subscriptions: (ownerId: number, restaurantId: number) =>
    axiosClient.get(
      `/superadmin/clicmenu/owners/${ownerId}/restaurants/${restaurantId}/subscriptions`
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