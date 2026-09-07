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
    // Se exigen porque se desreferencian al pintar: la portada es product.media[0], y una prenda
    // sin el campo reventaria en el componente en vez de decir aqui que la respuesta no vale.
    && (product.categoryId === null || typeof product.categoryId === 'string')
    && Array.isArray(product.media) && product.media.every(id => typeof id === 'string')
    && Array.isArray(product.variants) && product.variants.every(isVariant)
}

/**
 * Una llamada que devuelve un producto, juzgada siempre igual.
 *
 * <p>Las siete escrituras del catalogo contestan lo mismo -el producto entero, ya con sus
 * variantes- y por eso comparten como se juzga la respuesta: lo que no tiene la forma que el
 * contrato promete no se pinta, y lo que no llego se cuenta como problema de red. Repetir el
 * cuerpo siete veces daria siete sitios donde olvidarse de comprobarlo.
 */
async function answered(call: () => Promise<{ data?: unknown }>): Promise<TextileProduct> {
  try {
    const { data } = await call()
    if (!isProduct(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

const WAIT = 15_000

export async function listProducts(
  projectId: string, after?: string | null, limit = 20,
): Promise<ProductPage> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{projectId}/products', {
      params: { path: { projectId }, query: { after: after ?? undefined, limit } },
      signal: AbortSignal.timeout(WAIT),
    })
    const page = data as { items?: unknown, nextCursor?: unknown } | undefined
    if (!page || !Array.isArray(page.items) || !page.items.every(isProduct)) throw publicProblem(null)
    return {
      items: page.items,
      nextCursor: typeof page.nextCursor === 'string' ? page.nextCursor : null,
    }
  } catch (error) { throw safeProblem(error) }
}

export function createProduct(projectId: string, input: ProductInput): Promise<TextileProduct> {
  return answered(() => platform.POST('/api/v1/projects/{projectId}/products', {
    params: { path: { projectId } }, body: input, signal: AbortSignal.timeout(WAIT),
  }))
}

export function updateProduct(
  projectId: string, productId: string, input: ProductInput,
): Promise<TextileProduct> {
  return answered(() => platform.PATCH('/api/v1/projects/{projectId}/products/{productId}', {
    params: { path: { projectId, productId } }, body: input, signal: AbortSignal.timeout(WAIT),
  }))
}

/**
 * Retira el producto de la oferta.
 *
 * <p>No lo borra, y por eso contesta con el producto ya archivado: quien lo retira necesita ver que
 * sigue estando y que ya no se ofrece, porque una venta pasada lo sigue nombrando.
 */
export function archiveProduct(projectId: string, productId: string): Promise<TextileProduct> {
  return answered(() => platform.DELETE('/api/v1/projects/{projectId}/products/{productId}', {
    params: { path: { projectId, productId } }, signal: AbortSignal.timeout(WAIT),
  }))
}

export function addVariant(
  projectId: string, productId: string, input: VariantInput,
): Promise<TextileProduct> {
  return answered(() => platform.POST('/api/v1/projects/{projectId}/products/{productId}/variants', {
    params: { path: { projectId, productId } }, body: input, signal: AbortSignal.timeout(WAIT),
  }))
}

export function updateVariant(
  projectId: string, productId: string, variantId: string, input: VariantInput,
): Promise<TextileProduct> {
  return answered(() => platform.PUT(
    '/api/v1/projects/{projectId}/products/{productId}/variants/{variantId}', {
      params: { path: { projectId, productId, variantId } }, body: input,
      signal: AbortSignal.timeout(WAIT),
    }))
}

export function archiveVariant(
  projectId: string, productId: string, variantId: string,
): Promise<TextileProduct> {
  return answered(() => platform.DELETE(
    '/api/v1/projects/{projectId}/products/{productId}/variants/{variantId}', {
      params: { path: { projectId, productId, variantId } }, signal: AbortSignal.timeout(WAIT),
    }))
}

/**
 * El importe tal y como se teclea en un campo.
 *
 * <p>La division entre cien vive aqui y en ningun otro sitio. Repartida por los componentes,
 * bastaria que uno la hiciera distinto para que el mismo precio se ensenara de dos maneras.
 */
export function amountField(money: Money): string {
  return (money.amount / 100).toFixed(2)
}

/** El mismo importe dicho para leer, con su moneda delante y la coma que se usa al escribirlo. */
export function formatMoney(money: Money): string {
  return `${money.currency} ${amountField(money).replace('.', ',')}`
}

/** Al reves que formatMoney: lo que alguien teclea vuelve a ser un entero, o no es un precio. */
export function parseMoney(written: string, currency: string): Money | null {
  const decimal = written.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(decimal)) return null
  const [units, cents = ''] = decimal.split('.')
  return { amount: Number(units) * 100 + Number(cents.padEnd(2, '0')), currency }
}

export type ProductCategory = components['schemas']['ProductCategoryView']
export type ProductCollection = components['schemas']['ProductCollectionView']
export type CatalogBinding = components['schemas']['CatalogBindingView']
export type CatalogResolution = components['schemas']['CatalogResolutionView']

function isCategory(value: unknown): value is ProductCategory {
  if (!value || typeof value !== 'object') return false
  const category = value as Record<string, unknown>
  return typeof category.id === 'string' && typeof category.name === 'string'
    && typeof category.createdAt === 'string' && typeof category.updatedAt === 'string'
}

function isCollection(value: unknown): value is ProductCollection {
  if (!value || typeof value !== 'object') return false
  const collection = value as Record<string, unknown>
  return typeof collection.id === 'string' && typeof collection.name === 'string'
    && Array.isArray(collection.productIds)
    && collection.productIds.every(id => typeof id === 'string')
    && typeof collection.createdAt === 'string' && typeof collection.updatedAt === 'string'
}

export async function listCategories(projectId: string): Promise<ProductCategory[]> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{projectId}/categories', {
      params: { path: { projectId } }, signal: AbortSignal.timeout(WAIT),
    })
    if (!Array.isArray(data) || !data.every(isCategory)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function createCategory(projectId: string, name: string): Promise<ProductCategory> {
  try {
    const { data } = await platform.POST('/api/v1/projects/{projectId}/categories', {
      params: { path: { projectId } }, body: { name }, signal: AbortSignal.timeout(WAIT),
    })
    if (!isCategory(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function removeCategory(projectId: string, categoryId: string): Promise<void> {
  try {
    await platform.DELETE('/api/v1/projects/{projectId}/categories/{categoryId}', {
      params: { path: { projectId, categoryId } }, signal: AbortSignal.timeout(WAIT),
    })
  } catch (error) { throw safeProblem(error) }
}

/** Clasificar en nada es un estado real, y por eso el nulo viaja en vez de omitirse. */
export async function classifyProduct(
  projectId: string, productId: string, categoryId: string | null,
): Promise<void> {
  try {
    await platform.PUT('/api/v1/projects/{projectId}/products/{productId}/category', {
      params: { path: { projectId, productId } }, body: { categoryId },
      signal: AbortSignal.timeout(WAIT),
    })
  } catch (error) { throw safeProblem(error) }
}

export async function listCollections(projectId: string): Promise<ProductCollection[]> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{projectId}/collections', {
      params: { path: { projectId } }, signal: AbortSignal.timeout(WAIT),
    })
    if (!Array.isArray(data) || !data.every(isCollection)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function createCollection(projectId: string, name: string): Promise<ProductCollection> {
  try {
    const { data } = await platform.POST('/api/v1/projects/{projectId}/collections', {
      params: { path: { projectId } }, body: { name }, signal: AbortSignal.timeout(WAIT),
    })
    if (!isCollection(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

export async function removeCollection(projectId: string, collectionId: string): Promise<void> {
  try {
    await platform.DELETE('/api/v1/projects/{projectId}/collections/{collectionId}', {
      params: { path: { projectId, collectionId } }, signal: AbortSignal.timeout(WAIT),
    })
  } catch (error) { throw safeProblem(error) }
}

/** Los miembros se mandan enteros y en orden: ese orden es lo que la tienda ensena. */
export async function curateCollection(
  projectId: string, collectionId: string, productIds: string[],
): Promise<ProductCollection> {
  try {
    const { data } = await platform.PUT('/api/v1/projects/{projectId}/collections/{collectionId}/members', {
      params: { path: { projectId, collectionId } }, body: { productIds },
      signal: AbortSignal.timeout(WAIT),
    })
    if (!isCollection(data)) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/** La galeria se manda entera; la primera es la portada. */
export async function illustrateProduct(
  projectId: string, productId: string, assetIds: string[],
): Promise<string[]> {
  try {
    const { data } = await platform.PUT('/api/v1/projects/{projectId}/products/{productId}/media', {
      params: { path: { projectId, productId } }, body: { assetIds },
      signal: AbortSignal.timeout(WAIT),
    })
    if (!Array.isArray(data) || !data.every(id => typeof id === 'string')) throw publicProblem(null)
    return data
  } catch (error) { throw safeProblem(error) }
}

/**
 * Que ensena de verdad una binding, preguntado al servidor.
 *
 * <p>El Canvas no lo resuelve por su cuenta a proposito: si lo hiciera, la vista previa y la tienda
 * podrian ensenar cosas distintas en cuanto una de las dos se quedara vieja, y quien edita no
 * tendria forma de saber cual van a ver sus clientas.
 */
export async function resolveBinding(
  projectId: string, binding: CatalogBinding,
): Promise<CatalogResolution> {
  try {
    const { data } = await platform.GET('/api/v1/projects/{projectId}/catalog/resolution', {
      params: { path: { projectId }, query: {
        scope: binding.target, reference: binding.reference ?? undefined,
        limit: binding.limit, order: binding.order,
      } },
      signal: AbortSignal.timeout(WAIT),
    })
    const resolution = data as { products?: unknown, outcome?: unknown } | undefined
    if (!resolution || !Array.isArray(resolution.products) || !resolution.products.every(isProduct)
        || typeof resolution.outcome !== 'string') throw publicProblem(null)
    return { products: resolution.products, outcome: resolution.outcome as CatalogResolution['outcome'] }
  } catch (error) { throw safeProblem(error) }
}
