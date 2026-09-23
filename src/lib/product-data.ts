import { validMoney } from './profit';
export function productData(body: Record<string, unknown>) {
  if (!validMoney(body.price)) throw new Error('Enter a valid selling price (up to two decimals).');
  if (body.costPrice !== undefined && body.costPrice !== null && !validMoney(body.costPrice)) throw new Error('Enter a valid cost price or leave it blank.');
  if (typeof body.name !== 'string' || !body.name.trim() || typeof body.description !== 'string' || typeof body.category !== 'string' || typeof body.fabric !== 'string' || !Array.isArray(body.images) || !body.images.every(x => typeof x === 'string') || !Array.isArray(body.sizes) || !body.sizes.every(x => typeof x === 'string')) throw new Error('Invalid product details.');
  return {
    name: body.name, description: body.description, price: body.price,
    ...(body.costPrice !== undefined ? { costPrice: body.costPrice as number | null } : {}),
    category: body.category, fabric: body.fabric, images: body.images as string[], sizes: body.sizes as string[],
    stockStatus: body.stockStatus === 'Out of Stock' ? 'Out of Stock' : 'In Stock', featured: body.featured === true,
    ...(typeof body.productCode === 'string' && body.productCode ? { productCode: body.productCode } : {}),
  };
}
export function publicProduct<T extends { costPrice: number | null }>(product: T) {
  const { costPrice, ...fields } = product;
  void costPrice;
  return fields;
}
