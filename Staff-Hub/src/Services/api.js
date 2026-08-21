import axios, { create } from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api"
})



export const SignupUser=(data)=>{
    return api.post("/signup",data);
};


export const LoginUser=(data)=>{
    return api.post("/login",data);
}


export const forgetPassword = (data)=>{
    return api.post("/forgotPassword",data);
}
   

export const verifyOTP = (data)=>{
    return api.post("/verifyOtp",data);
}


export const resetPassword = (data)=>{
    return api.post("/reset-password",data);
}



