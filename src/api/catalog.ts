import { platform } from './client'
import { publicProblem, safeProblem } from './problems'
import type { components } from './schema'

export type TextileProduct = components['schemas']['TextileProductView']
export type SellableVariant = components['schemas']['SellableVariantView']
export type Money = components['schemas']['MoneyView']
export type ProductInput = components['schemas']['TextileProductInput']
export type VariantInput = components['schemas']['SellableVariantInput']

export interface ProductPage {
  items: TextileProduct[]
  nextCursor: string | null
}

function isMoney(value: unknown): value is Money {
  if (!value || typeof value !== 'object') return false
  const money = value as Record<string, unknown>
  // El importe llega en centimos enteros. Un decimal aqui seria un precio que ya viajo por un
  // flotante, y ese numero no se puede volver a creer.
  return typeof money.amount === 'number' && Number.isInteger(money.amount)
    && typeof money.currency === 'string' && /^[A-Z]{3}$/.test(money.currency)
}

function isVariant(value: unknown): value is SellableVariant {
  if (!value || typeof value !== 'object') return false
  const variant = value as Record<string, unknown>
  return typeof variant.id === 'string' && typeof variant.sku === 'string'
    && typeof variant.size === 'string' && typeof variant.color === 'string'
    && isMoney(variant.price) && typeof variant.pricedApart === 'boolean'
    && (variant.status === 'ACTIVE' || variant.status === 'ARCHIVED')
    && typeof variant.stock === 'number' && Number.isInteger(variant.stock) && variant.stock >= 0
}

function isProduct(value: unknown): value is TextileProduct {
  if (!value || typeof value !== 'object') return false
  const product = value as Record<string, unknown>
  return typeof product.id === 'string' && typeof product.name === 'string'
    && typeof product.description === 'string' && isMoney(product.basePrice)
    && (product.status === 'ACTIVE' || product.status === 'ARCHIVED')
    && typeof product.createdAt === 'string' && typeof product.updatedAt === 'string'
    && Array.isArray(product.variants) && product.variants.every(isVariant)
}

export async function listProducts(
  projectId: string, after?: string | null, limit = 20,
): Promise<ProductPage> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{projectId}/products', {
      params: { path: { projectId }, query: { after: after ?? undefined, limit } },
      signal: AbortSignal.timeout(15_000),
    })
    const page = data as { items?: unknown, nextCursor?: unknown } | undefined
    if (!page || !Array.isArray(page.items) || !page.items.every(isProduct)) throw publicProblem(null)
    return {
      items: page.items,
      nextCursor: typeof page.nextCursor === 'string' ? page.nextCursor : null,
    }
  } catch (error) { throw safeProblem(error) }
}

export async function createProduct(projectId: string, input: ProductInput): Promise<TextileProduct> {
  try {
    const { data } = await platform.POST('/api/v1/projects/{projectId}/products', {
      params: { path: { projectId } }, body: input, signal: AbortSignal.timeout(15_000),
    })
    if (!isProduct(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function updateProduct(
  projectId: string, productId: string, input: ProductInput,
): Promise<TextileProduct> {
  try {
    const { data } = await platform.PATCH('/api/v1/projects/{projectId}/products/{productId}', {
      params: { path: { projectId, productId } }, body: input, signal: AbortSignal.timeout(15_000),
    })
    if (!isProduct(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/**
 * Retira el producto de la oferta.
 *
 * <p>No lo borra, y por eso contesta con el producto ya archivado: quien lo retira necesita ver que
 * sigue estando y que ya no se ofrece, porque una venta pasada lo sigue nombrando.
 */
export async function archiveProduct(projectId: string, productId: string): Promise<TextileProduct> {
  try {
    const { data } = await platform.DELETE('/api/v1/projects/{projectId}/products/{productId}', {
      params: { path: { projectId, productId } }, signal: AbortSignal.timeout(15_000),
    })
    if (!isProduct(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function addVariant(
  projectId: string, productId: string, input: VariantInput,
): Promise<TextileProduct> {
  try {
    const { data } = await platform.POST('/api/v1/projects/{projectId}/products/{productId}/variants', {
      params: { path: { projectId, productId } }, body: input, signal: AbortSignal.timeout(15_000),
    })
    if (!isProduct(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function updateVariant(
  projectId: string, productId: string, variantId: string, input: VariantInput,
): Promise<TextileProduct> {
  try {
    const { data } = await platform.PUT(
      '/api/v1/projects/{projectId}/products/{productId}/variants/{variantId}', {
        params: { path: { projectId, productId, variantId } }, body: input,
        signal: AbortSignal.timeout(15_000),
      })
    if (!isProduct(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function archiveVariant(
  projectId: string, productId: string, variantId: string,
): Promise<TextileProduct> {
  try {
    const { data } = await platform.DELETE(
      '/api/v1/projects/{projectId}/products/{productId}/variants/{variantId}', {
        params: { path: { projectId, productId, variantId } }, signal: AbortSignal.timeout(15_000),
      })
    if (!isProduct(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/**
 * Un importe en centimos, escrito como lo lee una persona.
 *
 * <p>La division entre cien ocurre solo aqui, al pintar, y nunca al guardar: el numero que viaja y
 * el que se almacena siguen siendo enteros.
 */
export function formatMoney(money: Money): string {
  const units = Math.trunc(money.amount / 100)
  const cents = Math.abs(money.amount % 100).toString().padStart(2, '0')
  return `${money.currency} ${units},${cents}`
}

/** Al reves que formatMoney: lo que alguien teclea vuelve a ser un entero, o no es un precio. */
export function parseMoney(written: string, currency: string): Money | null {
  const digits = written.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(digits)) return null
  const [units, cents = ''] = digits.split('.')
  return { amount: Number(units) * 100 + Number(cents.padEnd(2, '0')), currency }
}
