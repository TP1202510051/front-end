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
export function surfaceStyleSheet(document: ProjectDocument | undefined): string {
  if (!document) return ''
  const lines: string[] = []
  for (const rule of document.theme?.rules ?? []) lines.push(ruleText(rule))
  for (const page of document.pages) {
    for (const component of page.components) {
      const declarations = Object.entries(component.styles ?? {})
      if (declarations.length === 0) continue
      lines.push(ruleText({
        selector: `.${SURFACE_CLASS} [data-component-id="${cssIdentifier(component.id)}"]`,
        declarations: Object.fromEntries(declarations),
      }))
    }
  }
  return lines.join('\n')
}

function ruleText(rule: StyleRule): string {
  const body = Object.entries(rule.declarations)
    .map(([property, value]) => `  ${property}: ${value};`).join('\n')
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
