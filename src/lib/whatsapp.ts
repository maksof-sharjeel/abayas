export interface WhatsAppProductDetails {
  id: string;
  name: string;
  productCode?: string;
  category?: string;
  fabric?: string;
  sizes?: string[];
  price: number;
  description?: string;
}

export function buildProductWhatsAppMessage(product: WhatsAppProductDetails, productUrl?: string) {
  const details = [
    'Hi SK Hand Embroidery, I want to order this product:',
    '',
    `Product: ${product.name}`,
    `Code: ${product.productCode || 'Not available'}`,
    `Category: ${product.category || 'Not specified'}`,
    `Fabric: ${product.fabric || 'Not specified'}`,
    `Available sizes: ${product.sizes?.length ? product.sizes.join(', ') : 'Please confirm'}`,
    `Price: PKR ${product.price.toLocaleString()}`,
    product.description ? `Description: ${product.description}` : '',
    productUrl ? `Product link: ${productUrl}` : '',
    '',
    'Please confirm availability and ordering details.',
  ];

  return details.filter(Boolean).join('\n');
}
