import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/product/Catalog";
import { categories, tools } from "@/data/tools";
type Props = { params: Promise<{ category: string }> };
export function generateStaticParams() {
  return categories.map((category) => ({ category: category.id }));
}
export const dynamicParams = false;
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const item = categories.find((entry) => entry.id === category);
  return item
    ? pageMetadata(item.name, item.description, `/categories/${item.id}`)
    : {};
}
export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const item = categories.find((entry) => entry.id === category);
  if (!item) notFound();
  return (
    <main id="main" className="catalog-shell">
      <header className="page-intro">
        <h1>{item.name}</h1>
        <p>{item.description}</p>
      </header>
      <Catalog tools={tools} category={item.id} />
    </main>
  );
}
