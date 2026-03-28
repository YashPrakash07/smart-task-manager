import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/prisma';

/**
 * AI SUMMARY ENGINE
 * 
 * This route connects to Google Gemini AI to analyze the user's current task list.
 * It uses a ReadableStream to send text chunks back to the frontend in real-time.
 */

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'AI key not configured' }), { status: 500 });
  }

  try {
    // 1. Fetch incomplete tasks from the database
    const tasks = await prisma.task.findMany({
      where: { completed: false },
      select: { title: true },
    });

    if (tasks.length === 0) {
      return new Response(JSON.stringify({ summary: 'You have no pending tasks. Enjoy your day!' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Initialize Gemini AI SDK
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      System: You are an elite productivity AI. I am going to give you a list of my daily tasks.
      Action: Analyze these tasks and provide a concise, motivational status update. 
      Limit the response to 3 short sentences maximum. Be encouraging. 
      
      Tasks: ${tasks.map((t) => t.title).join(', ')}
    `;
    
    // 3. GENERATE STREAMING CONTENT
    // Using models/gemini-flash-latest for high-performance low-latency response
    const result = await ai.models.generateContentStream({
      model: 'models/gemini-flash-latest',
      contents: prompt,
    });

    // 4. CONSTRUCT RESPONSE STREAM
    // This allows the frontend to decode text chunks as they arrive from Google
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Iterate over the chunks coming from the AI generator
          for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
              // Encode and send back to client
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
        } catch (err) {
          console.error('Streaming error:', err);
        } finally {
          // Close the HTTP connection once generation is complete
          controller.close();
        }
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error('Failed to generate summary:', error);
    // SAFELY EXTRACT ERROR MESSAGE FOR DEBUGGING: Checks if error is a valid JS Error object
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Failed to generate summary', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
