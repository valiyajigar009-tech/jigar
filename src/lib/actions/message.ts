"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function toggleMessageRead(id: string, isRead: boolean) {
  try {
    await prisma.message.update({
      where: { id },
      data: { isRead }
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMessage(id: string) {
  try {
    await prisma.message.update({
      where: { id },
      data: { isArchived: true }
    });
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
