import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    const where: any = {};
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
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
        ...body,
        productCode,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
