import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * El unico idioma del dictado. Es una decision del producto y no del navegador: la tienda se
 * describe en castellano, y la API de reconocimiento tampoco dice que idiomas ofrece de verdad,
 * asi que una lista aqui seria una promesa que nadie puede comprobar.
 */
export const DICTATION_LANGUAGE = 'es-PE'

export interface DictationState {
  /** Si el navegador ofrece reconocimiento; si no, se dice y se sigue escribiendo. */
  supported: boolean
  listening: boolean
  /** Si alguna pasada ya dejo texto: cambia "dictar" por "continuar". */
  dictated: boolean
  /** Lo que el reconocedor todavia esta corrigiendo. Se ensena; nunca entra en el texto. */
  interim: string
  /** Que paso, en palabras del panel; nunca el texto del navegador. */
  message: string | null
  start: () => void
  pause: () => void
  /** Corta la escucha sin decir nada: lo que llegara despues ya no tiene donde entrar. */
  abort: () => void
  /** Olvida que se dicto, para que el boton vuelva a decir "dictar". */
  reset: () => void
}

/**
 * Dictar en varias pasadas sobre un texto que sigue siendo de quien escribe.
 *
 * <p>Solo lo que el reconocedor da por definitivo llega a {@code onHeard}; lo provisional se
 * ensena aparte y desaparece, para que una palabra que el navegador todavia esta corrigiendo no
 * quede escrita como si alguien la hubiera confirmado. Pausar es dejar de escuchar sin tocar el
 * texto; continuar es otra sesion que anade detras. Y cuando la sesion se acaba sola -el navegador
 * la cierra tras un silencio- se dice como una pausa, no como un fallo: la salida es continuar.
 *
 * <p>Nada de esto envia nada. Enviar es de quien pulsa, con el texto delante.
 */
export function useDictation(onHeard: (heard: string) => void): DictationState {
  const [supported] = useState(() => Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition))
  const [listening, setListening] = useState(false)
  const [dictated, setDictated] = useState(false)
  const [interim, setInterim] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const recognition = useRef<SpeechRecognition | null>(null)
  const heard = useRef(onHeard)
  heard.current = onHeard

  useEffect(() => () => recognition.current?.abort(), [])

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    setMessage(null)
    setInterim('')
    const next = new SpeechRecognition()
    recognition.current = next
    next.lang = DICTATION_LANGUAGE
    next.continuous = true
    next.interimResults = true
    next.maxAlternatives = 1
    next.onstart = () => setListening(true)
    next.onresult = event => {
      let confirmed = ''
      let provisional = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (result.isFinal) confirmed += result[0].transcript
        else provisional += result[0].transcript
      }
      setInterim(provisional.trim())
      if (confirmed.trim()) {
        heard.current(confirmed.trim())
        setDictated(true)
        setMessage('Transcripción añadida. Revísala, sigue dictando o pulsa “Pedir propuesta” para enviarla.')
      }
    }
    next.onerror = event => {
      // Cortar la escucha a proposito, o que no se oyera nada, no son fallos: la sesion termina
      // y quien dicta decide si continua. Lo demas si se dice, sin el texto del navegador.
      if (event.error === 'aborted' || event.error === 'no-speech') return
      setMessage('No se pudo completar el dictado. La instrucción escrita sigue disponible.')
    }
    next.onend = () => {
      setListening(false)
      setInterim('')
      if (recognition.current !== next) return
      recognition.current = null
      setMessage(current => current ?? 'El dictado se detuvo; puedes continuar dictando o editar el texto.')
    }
    try { next.start() }
    catch { setListening(false); setMessage('No se pudo iniciar el dictado. Puedes seguir escribiendo.') }
  }, [])

  const pause = useCallback(() => recognition.current?.stop(), [])

  const abort = useCallback(() => {
    const current = recognition.current
    recognition.current = null
    current?.abort()
    setListening(false)
    setInterim('')
  }, [])

  const reset = useCallback(() => { setDictated(false); setMessage(null) }, [])

  return { supported, listening, dictated, interim, message, start, pause, abort, reset }
}
