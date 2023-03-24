// Set config defaults when creating the instance
import axios from "axios";
import { showFailToast } from 'vant';
import store from "../store";
import {useRouter} from "vue-router";
import routeConfig from "../config/routeConfig";



const myAxios = axios.create({
    // baseURL: 'http://jane.fit/py',
    baseURL: 'http://localhost/py',
    withCredentials: true,
});
// myAxios.defaults.withCredentials = true;

/**
 * 全局响应拦截器
 */
// 添加请求拦截器
myAxios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
myAxios.interceptors.response.use(async response => {
    if (response?.data?.code !== 200) {
        if (response?.data?.code === 40100) {
            store.commit("loginOut");
            window.location.href = '/';
        }
        if (response.data.description) {
            showFailToast(response.data.description);
        } else {
            showFailToast(response.data.message);
        }
    }
    // 对响应数据做点什么
    return response.data;
}, error => {
    // 对响应错误做点什么
    if (error.code === "ERR_NETWORK") {
        showFailToast("网络异常,请重试")
    }
    return Promise.reject(error);
});

export default myAxios;
