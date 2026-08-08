'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const addMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['admin', 'staff', 'student']),
  department: z.string().optional(),
});

export async function addMember(prevState: any, formData: FormData) {
  try {
    const validatedFields = addMemberSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
      return {
        type: "error",
        message: 'Invalid form data.',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
    // This is a mock action for member management in the prototype
    console.log('Adding new member (mock):', validatedFields.data);
    revalidatePath('/dashboard/admin');
    return { type: "success", message: `Successfully added ${validatedFields.data.name}.` };
  } catch (e: any) {
    return { type: "error", message: 'Database Error: Failed to add member.' };
  }
}

export async function triggerRevalidate(path: string) {
  revalidatePath(path);
}
