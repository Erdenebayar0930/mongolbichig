import { notFound } from "next/navigation";

import AdminHeading from "@/components/site/admin/AdminHeading";
import ProductForm from "@/components/site/admin/ProductForm";
import { adminGetProduct } from "@/lib/site/queries";

export const metadata = { title: "Бүтээгдэхүүн засах" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await adminGetProduct(id);

  if (!product) notFound();

  return (
    <>
      <AdminHeading title="Бүтээгдэхүүн засах" />
      <ProductForm product={product} />
    </>
  );
}
