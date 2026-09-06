import type { components } from '@/api/schema'
import type { ProjectDocument } from '@/canvas/intention'

export type ProjectTheme = components['schemas']['ProjectThemeView']
export type StyleRule = components['schemas']['StyleRuleView']

/** La clase de la superficie. El backend ya acota cada selector a ella; aqui solo se pone. */
export const SURFACE_CLASS = 'abstractify-store'

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
