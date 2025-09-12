import { get, post } from '@/utils/request'

export function login(data: { phone: string; code: string }) {
  return post('/login/sms', data)
}
