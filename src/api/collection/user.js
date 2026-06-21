import axiosInstance from "../axios/axiosInstance";

export const getUsers = async (page, limit, search) => {
  const response = await axiosInstance.get('/admin/users', {
    params: {
      page,
      limit,
      search,
    }
  });
  return response.data;
};


//Get single user details
export const getUserDetails = async (userId) => {
  const response = await axiosInstance.get(`/admin/users/${userId}`);
  return response.data;
};

//Update user status
export const updateUserStatus = async (userId, isActive) => {
  const response = await axiosInstance.patch(`/admin/users/${userId}/status`, {
    isActive,
  });
  return response.data;
};

//Delete user
export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};