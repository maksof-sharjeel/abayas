'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/LoadingState';

export default function NewOrderRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/orders');
  }, [router]);

  return <LoadingState label="Opening order form" />;
}
