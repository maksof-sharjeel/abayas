import { isAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.settings.create({
        data: {
          whatsappNumber: '923198271315',
          boutiqueDescription: 'SK Hand Embroidery Boutique - Exquisite hand-embroidered abayas and modest wear.',
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    
    const settings = await prisma.settings.upsert({
      where: { id: body.id || 'default' },
      update: body,
      create: body,
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
