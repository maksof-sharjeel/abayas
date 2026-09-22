import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
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
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to stream for Cloudinary
    const stream = Readable.from(buffer);

    return new Promise((resolve: (value: NextResponse) => void, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'abayas/products',
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.pipe(uploadStream);
    }).then((result: any) => {
      return NextResponse.json({ url: result.secure_url });
    }).catch((error: any) => {
      console.error('Error uploading to Cloudinary:', error);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
