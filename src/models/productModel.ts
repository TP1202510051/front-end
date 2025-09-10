export interface Product {
  id?: string
  name: string
  description: string
  price: number
  discount: number
  image: string
  categoryId: string
  sizes: SizeDto[]
}

export interface SizeDto {
  name: string
  isActive: boolean
}