import axiosInstance from "../axios/axiosInstance";

export const getNotifications = async (page, limit, search, status) => {
    const response = await axiosInstance.get('/admin/notifications', {
        params: {
            page,
            limit,
            search,
            status,
        }
    });
    return response.data;
};

export const deleteNotification = async (notificationId) => {
    const response = await axiosInstance.delete(`/admin/notifications/${notificationId}`);
    return response.data;
};


export const updateNotification = async (notificationId) => {
    const response = await axiosInstance.patch(`/admin/notifications/${notificationId}/read`);
    return response.data;
};


export const readAllNotifications = async () => {
    const response = await axiosInstance.patch(`/admin/notifications/read-all`);
    return response.data;
};






