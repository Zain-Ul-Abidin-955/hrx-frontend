import axiosInstance from "../axios/axiosInstance";


export const getAllBookings = async (page, limit, search) => {
  const response = await axiosInstance.get('/admin/bookings/all', {
    params: {
      page,
      limit,
      search,
    }
  });
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await axiosInstance.get(`/admin/bookings/${id}`);
  return response.data;
};