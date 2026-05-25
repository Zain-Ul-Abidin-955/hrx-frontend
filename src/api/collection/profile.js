import axiosInstance from "../axios/axiosInstance";

//Get profile information
export const getProfile = async () => {
    const response = await axiosInstance.get('/admin/auth/profile');
    return response.data;
};

//Update profile information
export const updateProfile = async (profileData) => {
    const response = await axiosInstance.put('/admin/auth/profile', profileData);
    return response.data;
};