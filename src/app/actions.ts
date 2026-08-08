'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from './lib/firebase/config';
import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';

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
    console.log('Adding new member (mock):', validatedFields.data);
    revalidatePath('/dashboard/admin');
    return { type: "success", message: `Successfully added ${validatedFields.data.name}.` };
  } catch (e: any) {
    return { type: "error", message: 'Database Error: Failed to add member.' };
  }
}

const addActivitySchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  documentationFile: z.any().optional(),
  sdgGoals: z.preprocess((val) => (Array.isArray(val) ? val : [val]), z.array(z.string())),
});

export async function addActivity(studentId: string, studentName: string, prevState: any, formData: FormData) {
  try {
    const rawData = {
      description: formData.get('description'),
      documentationFile: formData.get('documentationFile'),
      sdgGoals: formData.getAll('sdgGoals')
    };
    const validatedFields = addActivitySchema.safeParse(rawData);
    if (!validatedFields.success) {
      return {
        type: "error",
        message: 'Invalid form data.',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { description, documentationFile, sdgGoals } = validatedFields.data;
    const documentationLinks = documentationFile?.name ? [`/uploads/${documentationFile.name}`] : [];

    console.log('Adding new activity (mock):', { 
      studentId, 
      studentName,
      description,
      documentationLinks: documentationLinks,
      sdgGoals: sdgGoals.map(Number),
      status: 'pending',
      submittedAt: new Date(),
      points: 0,
     });
    
    revalidatePath('/dashboard/student');
    return { type: "success", message: 'Activity submitted successfully!' };

  } catch (e) {
    console.error(e);
    return { type: "error", message: 'Database Error: Failed to submit activity.' };
  }
}

export async function approveAndEvaluateActivity(activityId: string, staffId: string, evaluation: any) {
  try {
    console.log(`Approving and evaluating activity ${activityId} (mock):`, {
      evaluation,
      status: 'approved',
      verifiedBy: staffId,
      verifiedAt: new Date(),
      points: evaluation.totalScore
    });
    // Mock database update
    revalidatePath('/dashboard/staff/verify');
    return { type: "success", message: 'Activity approved and evaluated successfully.' };
  } catch (e) {
    console.error(e);
    return { type: "error", message: 'Database Error: Failed to evaluate submission.' };
  }
}

export async function rejectActivityWithReason(activityId: string, staffId: string, rejection: any) {
  try {
    console.log(`Rejecting activity ${activityId} (mock):`, {
      rejection,
      status: 'rejected',
      verifiedBy: staffId,
      verifiedAt: new Date()
    });
    // Mock database update
    revalidatePath('/dashboard/staff/verify');
    return { type: "success", message: 'Activity rejected successfully.' };
  } catch (e) {
    console.error(e);
    return { type: "error", message: 'Database Error: Failed to reject submission.' };
  }
}

export async function updateActivityStatus(activityId: string, status: 'approved' | 'rejected', feedback?: string) {
    try {
        console.log(`Updating activity ${activityId} to ${status} (legacy mock)`);
        revalidatePath('/dashboard/staff/verify');
        return { type: "success", message: `Submission ${status}.` };
    } catch (e) {
        console.error(e);
        return { type: "error", message: 'Database Error: Failed to update submission.' };
    }
}
