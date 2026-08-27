import { useEffect, useState } from 'react'

export function useValorConDebounce<TValor>(valor: TValor, demoraMs = 400): TValor {
  const [valorConDebounce, setValorConDebounce] = useState(valor)

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setValorConDebounce(valor)
    }, demoraMs)
    return () => window.clearTimeout(temporizador)
  }, [valor, demoraMs])

  return valorConDebounce
}
