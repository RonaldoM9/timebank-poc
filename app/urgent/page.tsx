import { getUrgentRequests } from "./actions";
import UrgentListClient from "./UrgentListClient";

export const dynamic = "force-dynamic";

export default async function UrgentPage() {
  const requests = await getUrgentRequests();
  return <UrgentListClient initialRequests={requests} />;
}
