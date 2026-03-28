import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
});

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = TaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: result.error.format() 
      }, { status: 400 });
    }

    const { title } = result.data;
    const task = await prisma.task.create({
      data: { title },
    });
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
