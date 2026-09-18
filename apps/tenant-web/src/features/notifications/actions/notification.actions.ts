"use server";

import { fetchApi } from "@/lib/api-client";

export async function getNotificationsAction(tenantId: string) {
  try {
    const url = `/api/v1/tenants/${tenantId}/notifications`;
    const res = await fetchApi(url, {
      method: "GET",
      cache: "no-store",
    });
    
    if (!res.ok) {
      return { data: [] };
    }
    
    return await res.json();
  } catch (err) {
    console.error("Failed to get notifications:", err);
    return { data: [] };
  }
}

export async function markNotificationAsReadAction(tenantId: string, notificationId: string) {
  try {
    const url = `/api/v1/tenants/${tenantId}/notifications/${notificationId}/read`;
    const res = await fetchApi(url, {
      method: "POST",
    });
    
    if (!res.ok) {
      return { success: false };
    }
    
    return await res.json();
  } catch (err) {
    console.error("Failed to mark notification as read:", err);
    return { success: false };
  }
}
