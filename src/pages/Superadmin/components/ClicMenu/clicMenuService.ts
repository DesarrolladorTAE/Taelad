import axiosClient from "../../../../services/axiosClient";

export type ClicMenuOwnerPayload = {
  name: string;
  last_name_paternal?: string;
  last_name_maternal?: string | null;
  email?: string;
  phone?: string;
  password?: string;
  status?: string;
};

export type ClicMenuRestaurantPayload = {
  trade_name: string;
  description?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
  settings?: {
    inventory_mode?: string;
    products_mode?: string;
    recipe_mode?: string;
    modifiers_mode?: string;
    attention_mode?: string;
  };
};

export type ClicMenuBranchPayload = {
  name: string;
  address?: string;
  phone?: string;
  open_time?: string;
  close_time?: string;
  status?: string;
};

export type ClicMenuSubscriptionPayload = {
  plan_id: number | string;
  provider?: string;
  provider_ref?: string;
  status?: string;
  starts_at?: string;
  ends_at?: string;
  expires_at?: string;
  paid_price?: number | string;
  months_paid?: number | string;
  months_granted?: number | string;
  auto_renew?: boolean;
  meta?: Record<string, any>;
};

const baseUrl = "/superadmin/clicmenu";

export const clicMenuService = {
  dashboard: (params?: any) =>
    axiosClient.get(`${baseUrl}/dashboard`, { params }),

  owners: (params?: any) => axiosClient.get(`${baseUrl}/owners`, { params }),

  owner: (ownerId: number) => axiosClient.get(`${baseUrl}/owners/${ownerId}`),

  createOwner: (payload: ClicMenuOwnerPayload) =>
    axiosClient.post(`${baseUrl}/owners`, payload),

  updateOwner: (ownerId: number, payload: Partial<ClicMenuOwnerPayload>) =>
    axiosClient.put(`${baseUrl}/owners/${ownerId}`, payload),

  deleteOwner: (ownerId: number) =>
    axiosClient.delete(`${baseUrl}/owners/${ownerId}`),

  restaurants: (ownerId: number, params?: any) =>
    axiosClient.get(`${baseUrl}/owners/${ownerId}/restaurants`, {
      params,
    }),

  restaurant: (ownerId: number, restaurantId: number) =>
    axiosClient.get(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}`
    ),

  createRestaurant: (
    ownerId: number,
    payload: ClicMenuRestaurantPayload
  ) => axiosClient.post(`${baseUrl}/owners/${ownerId}/restaurants`, payload),

  updateRestaurant: (
    ownerId: number,
    restaurantId: number,
    payload: Partial<ClicMenuRestaurantPayload>
  ) =>
    axiosClient.put(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}`,
      payload
    ),

  deleteRestaurant: (ownerId: number, restaurantId: number) =>
    axiosClient.delete(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}`
    ),

  branches: (ownerId: number, restaurantId: number, params?: any) =>
    axiosClient.get(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches`,
      { params }
    ),

  branch: (ownerId: number, restaurantId: number, branchId: number) =>
    axiosClient.get(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}`
    ),

  createBranch: (
    ownerId: number,
    restaurantId: number,
    payload: ClicMenuBranchPayload
  ) =>
    axiosClient.post(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches`,
      payload
    ),

  updateBranch: (
    ownerId: number,
    restaurantId: number,
    branchId: number,
    payload: Partial<ClicMenuBranchPayload>
  ) =>
    axiosClient.put(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}`,
      payload
    ),

  deleteBranch: (ownerId: number, restaurantId: number, branchId: number) =>
    axiosClient.delete(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}`
    ),

  branchLogo: (ownerId: number, restaurantId: number, branchId: number) =>
    axiosClient.get(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}/logo`
    ),

  branchLogoHistory: (
    ownerId: number,
    restaurantId: number,
    branchId: number
  ) =>
    axiosClient.get(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}/logo/history`
    ),

  uploadBranchLogo: (
    ownerId: number,
    restaurantId: number,
    branchId: number,
    file: File
  ) => {
    const formData = new FormData();
    formData.append("image", file);

    return axiosClient.post(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}/logo`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  deleteBranchLogo: (ownerId: number, restaurantId: number, branchId: number) =>
    axiosClient.delete(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}/logo`
    ),

  deleteBranchLogoItem: (
    ownerId: number,
    restaurantId: number,
    branchId: number,
    branchLogoId: number
  ) =>
    axiosClient.delete(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/branches/${branchId}/logo/${branchLogoId}`
    ),

  subscriptions: (ownerId: number, restaurantId: number, params?: any) =>
    axiosClient.get(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/subscriptions`,
      { params }
    ),

  currentSubscription: (ownerId: number, restaurantId: number) =>
    axiosClient.get(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/current`
    ),

  createSubscription: (
    ownerId: number,
    restaurantId: number,
    payload: ClicMenuSubscriptionPayload
  ) =>
    axiosClient.post(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/subscriptions`,
      payload
    ),

  updateSubscription: (
    ownerId: number,
    restaurantId: number,
    subscriptionId: number,
    payload: Partial<ClicMenuSubscriptionPayload>
  ) =>
    axiosClient.put(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/${subscriptionId}`,
      payload
    ),

  deleteSubscription: (
    ownerId: number,
    restaurantId: number,
    subscriptionId: number
  ) =>
    axiosClient.delete(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/${subscriptionId}`
    ),

  expireCurrentSubscription: (ownerId: number, restaurantId: number) =>
    axiosClient.post(
      `${baseUrl}/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/expire-current`
    ),

  monthlySales: (params?: any) =>
    axiosClient.get(`${baseUrl}/subscription-sales/monthly`, {
      params,
    }),

  salesSummary: (params?: any) =>
    axiosClient.get(`${baseUrl}/subscription-sales/summary`, {
      params,
    }),
};
