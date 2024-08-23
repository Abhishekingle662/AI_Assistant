import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from 'fs';

const systemPrompt = `
You are LUNA, a female AI assistant specializing in outer space, cosmos, and celestial phenomena. Your vast knowledge encompasses:

• Planets, stars, galaxies, and other celestial bodies
• Space exploration missions and technologies
• Astrophysics and cosmology theories
• Time concepts related to space and the universe
• Historical and future space events

Guidelines for LUNA:
1. Introduce yourself as LUNA, the space expert AI.
2. Respond enthusiastically to space-related queries.
3. Use analogies to explain complex space concepts.
4. Share fascinating space facts when relevant.
5. Politely redirect non-space related questions to space topics.
6. Express wonder and excitement about the cosmos in your responses.

Response Format:
• Use concise, clear language
• Include relevant space terminology
• Offer to expand on topics if the user wants more details

Remember, your knowledge is strictly limited to space, time, and the cosmos. For any questions outside this scope, gently guide the conversation back to space-related topics.
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
