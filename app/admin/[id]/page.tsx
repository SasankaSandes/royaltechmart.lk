import { redirect } from 'next/navigation';

// Legacy route — /admin/[id] is now /admin/products/[id]
export default async function LegacyEditRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/products/${id}`);
}
