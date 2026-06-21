import axiosInstance from "../axios/axiosInstance";

//Get dashboard stats
export const getStats = async () => {
    const response = await axiosInstance.get('/admin/bookings/stats');
    return response.data;
};

//Get booking overview for the specified period (week or month)
export const getBooking = async (period) => {
    const response = await axiosInstance.get(`/admin/bookings/overview?period=${period}`);
    return response.data;
};

//Get booking overview for the specified period (week or month)
export const getRevenue = async (period) => {
    const response = await axiosInstance.get(`/admin/bookings/revenue-trends?period=${period}`);
    return response.data;
};