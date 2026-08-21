interface JwtPayload {
  sub?: string
}

export function extraerUsuarioIdDelToken(accessToken: string): string | null {
  const segmentos = accessToken.split('.')
  if (segmentos.length !== 3) {
    return null
  }

  try {
    const base64 = segmentos[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}
