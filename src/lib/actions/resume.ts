"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createExperience(data: any) {
  try {
    const experience = await prisma.experience.create({
      data: {
        company: data.company,
        position: data.position,
        employmentType: data.employmentType || "Full-time",
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        currentJob: data.currentJob || false,
        description: data.description,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder.toString()) : 0
      }
    });
    revalidatePath("/admin/resume");
    revalidatePath("/");
    return { success: true, experience };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateExperience(id: string, data: any) {
  try {
    const experience = await prisma.experience.update({
      where: { id },
      data: {
        company: data.company,
        position: data.position,
        employmentType: data.employmentType || "Full-time",
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        currentJob: data.currentJob || false,
        description: data.description,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder.toString()) : 0
      }
    });
    revalidatePath("/admin/resume");
    revalidatePath("/");
    return { success: true, experience };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createEducation(data: any) {
  try {
    const education = await prisma.education.create({
      data: {
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder.toString()) : 0
      }
    });
    revalidatePath("/admin/resume");
    revalidatePath("/");
    return { success: true, education };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEducation(id: string, data: any) {
  try {
    const education = await prisma.education.update({
      where: { id },
      data: {
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        description: data.description,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder.toString()) : 0
      }
    });
    revalidatePath("/admin/resume");
    revalidatePath("/");
    return { success: true, education };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
