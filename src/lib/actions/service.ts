"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createService(data: any) {
  try {
    const service = await prisma.service.create({
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder.toString()) : 0
      }
    });
    revalidatePath("/admin/services");
    revalidatePath("/");
    return { success: true, service };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateService(id: string, data: any) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        icon: data.icon,
        sortOrder: data.sortOrder ? parseInt(data.sortOrder.toString()) : 0
      }
    });
    revalidatePath("/admin/services");
    revalidatePath("/");
    return { success: true, service };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/services");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
