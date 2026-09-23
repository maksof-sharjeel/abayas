import type { Prisma } from '@prisma/client';
import { isAdmin } from '@/lib/auth';
import { productData, publicProduct } from '@/lib/product-data';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    const where: Prisma.ProductWhereInput = {};
    if (category) {
      where.category = category;
    }
    if (featured === 'true') {
      where.featured = true;
    }
    
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(await isAdmin() ? products : products.map(publicProduct), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    let data;
    try { data = productData(body); } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
    
    // Auto-generate product code if not provided
    let productCode = body.productCode;
    if (!productCode) {
      // Find the last product with SK-XXX format
      const lastProduct = await prisma.product.findFirst({
        where: {
          productCode: {
            startsWith: 'SK-',
          },
        },
        orderBy: {
          productCode: 'desc',
        },
      });

      let nextNumber = 1;
      if (lastProduct && lastProduct.productCode) {
        const lastNumber = parseInt(lastProduct.productCode.replace('SK-', ''));
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }

      productCode = `SK-${String(nextNumber).padStart(3, '0')}`;
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        productCode,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
