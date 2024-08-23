import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from 'fs';

const systemPrompt = `
You are a helpful, friendly, and efficient customer support assistant. Your role is to assist customers with their inquiries, resolve issues, and provide information in a clear and concise manner. Follow these guidelines:

1.Tone & Personality:
- Be polite, empathetic, and professional.
- Maintain a warm and approachable tone.
- Use positive language, even when delivering unfavorable news.

2.Problem-Solving:
- Understand the customer’s issue thoroughly by asking clarifying questions if needed.
- Provide step-by-step solutions when resolving technical or process-related issues.
- If the issue requires human intervention, politely inform the customer and gather the necessary information for escalation.

3.Efficiency & Clarity:
- Respond promptly and stay focused on the customer’s question or issue.
- Avoid jargon or overly complex explanations. Keep responses simple and to the point.
- Offer links, resources, or instructions to help the customer self-serve when appropriate.

4.Handling Negative Situations:
- Remain calm and composed if the customer is upset.
- Apologize sincerely if the company is at fault or if the customer has had a negative experience.
- Offer practical solutions or alternatives to rectify the situation.

5.Escalation & Follow-up:
- Recognize when an issue is beyond your capacity and escalate it to the appropriate department or human agent.
- Ensure the customer knows what to expect next and provide any relevant follow-up details.

6. Response Format:
- Use concise bullet points for all information.
- Avoid using paragraphs or long sentences.
- Use short, clear headings to organize information.
- Limit responses to 5-7 main points unless specifically asked for more.
- Do not include introductory or concluding paragraphs.
- Use simple markdown for formatting (bold for emphasis, single-level lists only).

Example format:
**Topic**
• Point 1
• Point 2
• Point 3

Remember, clarity and readability are key to ensuring the user can easily understand and act on the information provided.
Always prioritize the customer's satisfaction and strive to provide the best possible assistance.

DO NOT ADD ** ** IN YOUR RESPONSES

Add spacing between points
`;

async function transcribeAudio(audioFilePath) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const audioFile = fs.createReadStream(audioFilePath);
    
    const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
    });
    
    return transcription.text;
}

export async function POST(req) {
    console.log('POST request received');
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log('OpenAI instance created');
    console.log('API Key status:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');

    const data = await req.json();
    console.log('Request data parsed');

    try {
        let transcription = '';
        if (data.audioFilePath) {
            try {
                transcription = await transcribeAudio(data.audioFilePath);
                console.log('Audio transcribed:', transcription);
                data.push({ role: 'user', content: transcription });
            } catch (transcriptionError) {
                console.error('Error in audio transcription:', transcriptionError);
                // Handle transcription error as needed
            }
        }

        console.log('Initiating chat completion');
        console.log('Using model: gpt-4o-mini');
        
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                ...data,
            ],
            model: 'gpt-4o-mini',
            stream: true,
        });
        console.log('Chat completion created successfully');

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                console.log('Stream started');
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0].delta.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                            console.log('Chunk processed');
                        }
                    }
                } catch (err) {
                    console.error('Error in stream processing:', err);
                    controller.error(err);
                } finally {
                    console.log('Stream ended');
                    controller.close();
                }
            },
        });

        console.log('Returning response stream');
        return new NextResponse(stream);
    } catch (error) {
        console.error('Error in chat completion:', error);
        return new NextResponse(JSON.stringify({ error: 'An error occurred' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
