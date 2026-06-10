"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createBlogPost(data: any) {
  try {
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        featuredImage: data.featuredImage || null,
        status: data.status,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        readingTime: data.readingTime || 0,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    
    revalidatePath("/admin/blog");
    return { success: true, post };
  } catch (error: any) {
    console.error("Failed to create post", error);
    return { success: false, error: error.message };
  }
}

export async function updateBlogPost(id: string, data: any) {
  try {
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        featuredImage: data.featuredImage || null,
        status: data.status,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        readingTime: data.readingTime || 0,
        publishedAt: data.status === "PUBLISHED" && !data.publishedAt ? new Date() : undefined,
      },
    });
    
    revalidatePath("/admin/blog");
    revalidatePath(`/admin/blog/${id}`);
    return { success: true, post };
  } catch (error: any) {
    console.error("Failed to update post", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlogPost(id: string) {
  try {
    await prisma.blogPost.delete({
      where: { id }
    });
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
