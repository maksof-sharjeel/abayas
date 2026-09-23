import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Everyday Edit', slug: 'everyday-edit', description: 'Quiet, effortless layers for everyday dressing.' },
  { name: 'Hand Embroidered', slug: 'hand-embroidered', description: 'Small-batch abayas finished by hand in our studio.' },
  { name: 'Occasion', slug: 'occasion', description: 'Refined silhouettes for gatherings and celebrations.' },
  { name: 'Minimal', slug: 'minimal', description: 'Clean lines, soft fabrics and understated detail.' },
];

const products = [
  {
    productCode: 'SK-001',
    name: 'Noor Black Abaya',
    description: 'A fluid black nida abaya with tonal threadwork along the cuffs and front panel. Designed for easy, elegant movement.',
    price: 12900,
    category: 'Hand Embroidered',
    fabric: 'Premium Nida',
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85'],
    sizes: ['52', '54', '56', '58'],
    stockStatus: 'In Stock',
    featured: true,
  },
  {
    productCode: 'SK-002',
    name: 'Sahar Mocha Layer',
    description: 'Warm mocha layering piece with a relaxed cut, concealed front and a softly structured shoulder.',
    price: 14800,
    category: 'Everyday Edit',
    fabric: 'Korean Nida',
    images: ['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85'],
    sizes: ['52', '54', '56'],
    stockStatus: 'In Stock',
    featured: true,
  },
  {
    productCode: 'SK-003',
    name: 'Maira Sand Abaya',
    description: 'A soft sand-toned abaya with delicate geometric embroidery and a practical everyday silhouette.',
    price: 11500,
    category: 'Minimal',
    fabric: 'Zoom Nida',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85'],
    sizes: ['52', '54', '56', '58'],
    stockStatus: 'In Stock',
    featured: true,
  },
  {
    productCode: 'SK-004',
    name: 'Ayla Olive Statement',
    description: 'An olive occasion abaya with hand-finished botanical embroidery for evenings that call for something special.',
    price: 17600,
    category: 'Occasion',
    fabric: 'Premium Crepe',
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85'],
    sizes: ['54', '56', '58'],
    stockStatus: 'In Stock',
    featured: true,
  },
  {
    productCode: 'SK-005',
    name: 'Raya Charcoal Essential',
    description: 'A charcoal daily essential with a clean fall, hidden pockets and an easy open front.',
    price: 9800,
    category: 'Everyday Edit',
    fabric: 'Nida',
    images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85'],
    sizes: ['52', '54', '56', '58'],
    stockStatus: 'In Stock',
    featured: false,
  },
  {
    productCode: 'SK-006',
    name: 'Zoya Rust Embroidery',
    description: 'A rich rust abaya with copper embroidery, cut for graceful drape and special occasions.',
    price: 15900,
    category: 'Hand Embroidered',
    fabric: 'Korean Nida',
    images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85'],
    sizes: ['54', '56', '58'],
    stockStatus: 'In Stock',
    featured: false,
  },
];

const paymentMethods = [
  {
    name: 'Bank Transfer',
    accountTitle: 'SK Hand Embroidery (Demo)',
    accountNumber: '01234567890123',
    ibanNumber: 'PK00 DEMO 0000 1234 5678 90',
    bank: 'Meezan Bank (Demo)',
    instructions: 'These are demo details. Replace them from Admin > Payment Methods before accepting payments.',
    isActive: true,
  },
  {
    name: 'Easypaisa',
    accountTitle: 'SK Hand Embroidery (Demo)',
    accountNumber: '0312 0000000',
    ibanNumber: '',
    bank: 'Easypaisa (Demo)',
    instructions: 'These are demo details. Replace them from Admin > Payment Methods before accepting payments.',
    isActive: true,
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category });
  }

  for (const product of products) {
    await prisma.product.upsert({ where: { productCode: product.productCode }, update: product, create: product });
  }

  await prisma.settings.upsert({
    where: { id: 'boutique-settings' },
    update: {},
    create: {
      id: 'boutique-settings',
      whatsappNumber: '923122789939',
      boutiqueDescription: 'Thoughtfully made abayas with hand embroidery, fluid fabrics and a distinctly Lahore point of view.',
    },
  });

  for (const paymentMethod of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: paymentMethod.name },
      update: paymentMethod,
      create: paymentMethod,
    });
  }

  console.log(`Seeded ${categories.length} categories, ${products.length} products, and ${paymentMethods.length} payment methods.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
