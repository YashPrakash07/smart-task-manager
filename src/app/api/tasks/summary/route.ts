import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: { completed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (tasks.length === 0) {
      return NextResponse.json({ summary: "You have no pending tasks. Enjoy your day!" });
    }

    const taskList = tasks.map((t: { title: string }) => `- ${t.title}`).join('\n');
    const prompt = `You are a helpful and kind assistant providing a daily briefing for the user's task manager.
Here are the user's pending tasks:
${taskList}

Please write a short, friendly plain-English paragraph summarizing what they need to do today. Give them a quick word of encouragement, but keep it concise and actionable.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ summary: response.text });
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
