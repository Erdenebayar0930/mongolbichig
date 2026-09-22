import { notFound } from "next/navigation";

import AdminHeading from "@/components/site/admin/AdminHeading";
import NewsForm from "@/components/site/admin/NewsForm";
import { adminGetNews } from "@/lib/site/queries";

export const metadata = { title: "Мэдээ засах" };

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await adminGetNews(id);

  if (!post) notFound();

  return (
    <>
      <AdminHeading title="Мэдээ засах" />
      <NewsForm post={post} />
    </>
  );
}
