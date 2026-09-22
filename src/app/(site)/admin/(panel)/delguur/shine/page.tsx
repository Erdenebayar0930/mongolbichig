import AdminHeading from "@/components/site/admin/AdminHeading";
import ProductForm from "@/components/site/admin/ProductForm";

export const metadata = { title: "Шинэ бүтээгдэхүүн" };

export default function NewProductPage() {
  return (
    <>
      <AdminHeading title="Шинэ бүтээгдэхүүн" />
      <ProductForm />
    </>
  );
}
