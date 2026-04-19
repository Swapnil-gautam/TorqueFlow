import { problems } from "@/data/problems";
import ProblemPageClient from "./ProblemPageClient";

export function generateStaticParams() {
  return problems.map((p) => ({ slug: p.slug }));
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProblemPageClient slug={slug} />;
}
