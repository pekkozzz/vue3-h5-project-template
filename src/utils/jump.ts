import { updateCurrentHref, generateUrl } from './location'

/*
与页面跳转相关的通用函数
*/

// 跳转到面客端登录
export function toCustomerLogin() {
  const url = generateUrl(import.meta.env.VITE_CUSTOMER_LOGIN, 'login/sms', {
    redirect: encodeURIComponent(window.location.href)
  })
  updateCurrentHref(url)
}
