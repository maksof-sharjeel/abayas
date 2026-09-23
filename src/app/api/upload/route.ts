import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Upload a JPG, PNG or WebP image up to 5 MB' }, { status: 400 });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to stream for Cloudinary
    const stream = Readable.from(buffer);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'abayas/products', resource_type: 'image' },
        (error, uploaded) => {
          if (error) reject(error);
          else if (uploaded) resolve(uploaded);
          else reject(new Error('Cloudinary returned no upload result'));
        }
      );
      stream.on('error', reject);
      uploadStream.on('error', reject);
      stream.pipe(uploadStream);
    });
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
