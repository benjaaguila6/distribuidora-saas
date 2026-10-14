// Genera contraseñas temporales del lado del cliente para el reset de
// contraseña. El backend de reset recibe la contraseña nueva y responde 204 (no
// genera ni devuelve una temporal), así que la generamos acá con Web Crypto y
// cumplimos la política vigente: mínimo 8 caracteres, al menos una mayúscula y
// un dígito. No depende de ninguna librería externa.

const LONGITUD_PREDETERMINADA = 12

// Alfabetos sin caracteres ambiguos (0/O, 1/l/I) para facilitar el tipeo al
// compartir la contraseña temporal.
const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const MINUSCULAS = 'abcdefghijkmnpqrstuvwxyz'
const DIGITOS = '23456789'
const SIMBOLOS = '!@#$%*?'
const TODOS = MAYUSCULAS + MINUSCULAS + DIGITOS + SIMBOLOS

// Entero uniforme en [0, maxExclusivo) evitando el sesgo del módulo.
function enteroAleatorio(maxExclusivo: number): number {
  const limite = Math.floor(0x100000000 / maxExclusivo) * maxExclusivo
  const buffer = new Uint32Array(1)
  let valor = 0
  do {
    crypto.getRandomValues(buffer)
    valor = buffer[0]
  } while (valor >= limite)
  return valor % maxExclusivo
}

export function generarPasswordTemporal(longitud: number = LONGITUD_PREDETERMINADA): string {
  const caracteres: string[] = [
    MAYUSCULAS[enteroAleatorio(MAYUSCULAS.length)],
    MINUSCULAS[enteroAleatorio(MINUSCULAS.length)],
    DIGITOS[enteroAleatorio(DIGITOS.length)],
  ]

  for (let i = caracteres.length; i < longitud; i++) {
    caracteres.push(TODOS[enteroAleatorio(TODOS.length)])
  }

  // Fisher-Yates con fuente criptográfica: las posiciones obligatorias no
  // quedan en un orden predecible.
  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = enteroAleatorio(i + 1)
    const temporal = caracteres[i]
    caracteres[i] = caracteres[j]
    caracteres[j] = temporal
  }

  return caracteres.join('')
}
