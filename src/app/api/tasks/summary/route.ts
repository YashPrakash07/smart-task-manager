import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: { completed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (tasks.length === 0) {
      return new Response(JSON.stringify({ summary: "You have no pending tasks. Enjoy your day!" }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const taskList = tasks.map((t: { title: string }) => `- ${t.title}`).join('\n');
    const prompt = `You are a helpful and kind assistant providing a daily briefing for the user's task manager.
Here are the user's pending tasks:
${taskList}

Please write a short, friendly plain-English paragraph summarizing what they need to do today. Give them a quick word of encouragement, but keep it concise and actionable.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    
    // Use streaming
    const result = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-lite',
      contents: prompt,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error('Streaming error:', err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate summary', details: (error as any).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
