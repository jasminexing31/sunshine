'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addInstructor(data: {
  name: string;
  certificationLevel: number;
  email?: string | null;
  phone?: string | null;
  isActive?: boolean;
}) {
  const instructor = await prisma.instructor.create({
    data: {
      name: data.name,
      certificationLevel: data.certificationLevel,
      email: data.email,
      phone: data.phone,
      isActive: data.isActive ?? true,
    },
  });
  revalidatePath('/roster');
  return instructor;
}

export async function updateInstructor(
  id: number,
  data: {
    name?: string;
    certificationLevel?: number;
    email?: string | null;
    phone?: string | null;
    isActive?: boolean;
  }
) {
  const instructor = await prisma.instructor.update({
    where: { id },
    data,
  });
  revalidatePath('/roster');
  revalidatePath('/schedule');
  return instructor;
}

export async function deactivateInstructor(id: number) {
  const instructor = await prisma.instructor.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath('/roster');
  return instructor;
}
