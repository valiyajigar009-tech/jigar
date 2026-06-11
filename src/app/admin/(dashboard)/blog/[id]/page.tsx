import { prisma } from "@/lib/db/prisma";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await prisma.blogPost.findUnique({
    where: { id }
  });

  if (!post) {
    notFound();
  }

  // Parse JSON fields if they exist
  const initialData = {
    ...post,
    tags: post.tags ? JSON.parse(post.tags) : [],
    categories: post.categories ? JSON.parse(post.categories) : [],
  };

  return <BlogForm initialData={initialData} />;
}
