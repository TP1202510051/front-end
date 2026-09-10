import type { components } from '@/api/schema'
import type { ProjectDocument } from '@/canvas/intention'

export type ProjectTheme = components['schemas']['ProjectThemeView']
export type StyleRule = components['schemas']['StyleRuleView']
export type KeyframeSet = components['schemas']['KeyframeSetView']

/** La clase de la superficie. El backend ya acota cada selector a ella; aqui solo se pone. */
export const SURFACE_CLASS = 'abstractify-store'

/**
 * Lo que la superficie hace siempre con el movimiento cuando quien mira pide menos movimiento.
 *
 * <p>No es parte del documento: nadie lo escribio y no es por proyecto. Es una regla de cualquier
 * superficie que pinte un Theme, igual que la clase que acota los selectores, y por eso vive aqui y
 * no en el backend. Una tienda que se mueve es una tienda que algunas compradoras no pueden usar
 * comodamente, y eso no depende de que marca sea. La tienda generada tiene que emitir la misma.
 *
 * <p>Va la ultima, con {@code !important}, porque tiene que ganar a lo que la marca declare: es la
 * preferencia de quien mira sobre la de quien diseno, y en esto manda quien mira.
 */
export const REDUCED_MOTION_RULE = `@media (prefers-reduced-motion: reduce) {
  .${SURFACE_CLASS} * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}`

/**
 * Los tokens del Theme como propiedades personalizadas de la superficie.
 *
 * <p>Van en la superficie y no en la raiz del documento a proposito: puestas en la raiz teñirian
 * tambien la aplicacion que rodea al Canvas, y un Theme es de la tienda, no de Abstractify.
 */
export function surfaceTokens(theme: ProjectTheme | undefined): Record<string, string> {
  const style: Record<string, string> = {}
  for (const [name, value] of Object.entries(theme?.tokens ?? {})) style[`--${name}`] = value
  return style
}

/**
 * El CSS que se pinta, hecho de lo que ya vino canonico.
 *
 * <p>Nada se interpreta aqui: los selectores llegan acotados desde que se aceptaron y las
 * declaraciones ya pasaron por la lista del servidor. Esta funcion solo las escribe, de modo que
 * no haya un segundo sitio decidiendo que es seguro -y por tanto, ningun sitio donde discrepar-.
 *
 * <p>Los estilos propios de cada instancia van despues de las reglas del proyecto: con la misma
 * especificidad, lo que gana es lo ultimo, y una instancia tiene que poder pisar al Theme.
 */
export function surfaceStyleSheet(
  document: ProjectDocument | undefined, assets: Readonly<Record<string, string>> = {},
): string {
  if (!document) return ''
  const lines: string[] = []
  // Los movimientos van antes que quien los cita; el orden no cambia lo que significan, pero se lee
  // como se escribe un CSS a mano.
  for (const set of document.theme?.keyframes ?? []) lines.push(keyframesText(set, assets))
  for (const rule of document.theme?.rules ?? []) lines.push(ruleText(rule, assets))
  for (const page of document.pages) {
    for (const component of page.components) {
      const declarations = Object.entries(component.styles ?? {})
      if (declarations.length === 0) continue
      lines.push(ruleText({
        selector: `.${SURFACE_CLASS} [data-component-id="${cssIdentifier(component.id)}"]`,
        declarations: Object.fromEntries(declarations),
      }, assets))
    }
  }
  lines.push(REDUCED_MOTION_RULE)
  return lines.filter(Boolean).join('\n')
}

const ASSET_REFERENCE = /asset\(\s*([a-f0-9]{64})\s*\)/g

/** Los assets que un documento cita, para saber cuales hay que traer y cuales pueden faltar. */
export function citedAssets(document: ProjectDocument | undefined): string[] {
  if (!document) return []
  const found = new Set<string>()
  const collect = (declarations: Record<string, string>) => {
    for (const value of Object.values(declarations)) {
      for (const match of value.matchAll(ASSET_REFERENCE)) found.add(match[1])
    }
  }
  for (const rule of document.theme?.rules ?? []) collect(rule.declarations)
  for (const set of document.theme?.keyframes ?? []) {
    for (const frame of set.frames) collect(frame.declarations)
  }
  for (const page of document.pages) {
    for (const component of page.components) collect(component.styles ?? {})
  }
  return [...found]
}

/**
 * Convierte una cita en algo que el navegador pueda pintar.
 *
 * <p>Lo que el documento guarda es una identidad, no una direccion: {@code asset(<id>)}. Aqui se
 * cambia por la URL local de los bytes que ya se trajeron con la autorizacion de quien mira, de modo
 * que la direccion que acaba en el CSS nunca la escribio quien edita.
 *
 * @returns la declaracion resuelta, o null si cita un asset que no se pudo traer
 */
function resolved(value: string, assets: Readonly<Record<string, string>>): string | null {
  let missing = false
  const text = value.replace(ASSET_REFERENCE, (_, id: string) => {
    const url = assets[id]
    if (!url) { missing = true; return '' }
    return `url("${url}")`
  })
  return missing ? null : text
}

/**
 * Un movimiento, escrito tal como llego.
 *
 * <p>El nombre ya viene acotado desde el servidor, como el selector de una regla: aqui se pone y no se
 * toca. Un paso que cita un asset ausente se cae entero, y solo el, por lo mismo que una regla: que
 * falte una imagen no puede dejar la tienda sin moverse.
 */
function keyframesText(set: KeyframeSet, assets: Readonly<Record<string, string>>): string {
  const frames = set.frames.map(frame => {
    const body = Object.entries(frame.declarations)
      .map(([property, value]) => [property, resolved(value, assets)] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] !== null)
      .map(([property, value]) => `    ${property}: ${value};`).join('\n')
    return body ? `  ${frame.offsets.join(', ')} {\n${body}\n  }` : ''
  }).filter(Boolean).join('\n')
  return frames ? `@keyframes ${set.name} {\n${frames}\n}` : ''
}

function ruleText(rule: StyleRule, assets: Readonly<Record<string, string>>): string {
  const body = Object.entries(rule.declarations)
    // Una declaracion que cita un asset ausente se cae entera, y solo ella: pintar el resto de la
    // regla es lo que hace que falte una imagen en vez de romperse la tienda.
    .map(([property, value]) => [property, resolved(value, assets)] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== null)
    .map(([property, value]) => `  ${property}: ${value};`).join('\n')
  if (!body) return ''
  const rule_ = `${rule.selector} {\n${body}\n}`
  return rule.media ? `@media ${rule.media} {\n${rule_}\n}` : rule_
}

/**
 * Un identificador de componente, escrito de forma que no pueda cerrar el selector.
 *
 * <p>El identificador lo eligio quien edita, asi que aqui no se supone nada de el: sin esto, uno con
 * comillas dentro terminaria la regla antes de tiempo y lo que viniera despues se leeria como CSS
 * propio. Es el unico trozo de estas hojas que no llega ya validado.
 */
function cssIdentifier(id: string): string {
  return id.replace(/["\\\n\r]/g, '')
}
