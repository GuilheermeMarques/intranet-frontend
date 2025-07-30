import { ClientDetails } from './ClientDetails';

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientDetails clientId={id} />;
}
