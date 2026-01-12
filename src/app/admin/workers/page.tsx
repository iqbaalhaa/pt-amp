import { getWorkers } from "@/actions/worker-actions";
import WorkerClient from "@/components/admin/workers/WorkerClient";

export default async function WorkersPage() {
  const workers = await getWorkers();

  return <WorkerClient initialWorkers={workers} />;
}
