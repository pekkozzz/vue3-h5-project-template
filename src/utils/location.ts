
export function generateUrl(origin: string, pathname:string, query: object) {
  const queryString = Object.keys(query).map(key => `${key}=${(query as Record<string, string>)[key]}`).join('&')
  return `${origin}/${pathname}?${queryString}`
}

export function updateCurrentHref(url: string) {
  window.location.href = url
}
