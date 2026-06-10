"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(data: any) {
  try {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        thumbnail: data.thumbnail || "",
        category: data.category,
        status: data.status,
        featured: data.featured,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        techStack: data.techStack ? JSON.stringify(data.techStack) : null,
      },
    });
    
    revalidatePath("/admin/projects");
    return { success: true, project };
  } catch (error: any) {
    console.error("Failed to create project", error);
    return { success: false, error: error.message };
  }
}

export async function updateProject(id: string, data: any) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        thumbnail: data.thumbnail || "",
        category: data.category,
        status: data.status,
        featured: data.featured,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        techStack: data.techStack ? JSON.stringify(data.techStack) : null,
      },
    });
    
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);
    return { success: true, project };
  } catch (error: any) {
    console.error("Failed to update project", error);
    return { success: false, error: error.message };
  }
}

export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id }
    });
    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
