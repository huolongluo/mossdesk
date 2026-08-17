import { notFound } from "next/navigation";
import { JobLive } from "@/components/JobLive";
import { getJob } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();
  return <JobLive initial={job} />;
}
