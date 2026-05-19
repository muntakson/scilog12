import { AIProvider } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };
export type ChatResult = { reply: string; inputTokens?: number; outputTokens?: number };

const SYSTEM = `You are scilog12's lab assistant for a year 7-12 student. Give clear, educational, age-appropriate help with experimental design, 3D-printable parts (OpenSCAD/CadQuery), microcontroller firmware, data analysis, and lab logbook writing. When generating code, include comments. When safety matters (chemistry, lasers, high voltage), warn the student.`;

export function isProviderConfigured(p: AIProvider): boolean {
  switch (p) {
    case 'ANTHROPIC': return !!process.env.ANTHROPIC_API_KEY;
    case 'GEMINI':    return !!process.env.GEMINI_API_KEY;
    case 'GROQ':      return !!process.env.GROQ_API_KEY;
    case 'DEEPSEEK':  return !!process.env.DEEPSEEK_API_KEY;
  }
}

export async function callProvider(provider: AIProvider, model: string, history: ChatMessage[]): Promise<ChatResult> {
  if (!isProviderConfigured(provider)) {
    return {
      reply: `⚠ The ${provider} provider isn't configured on this server. Set the corresponding API key in .env and restart, or pick another provider. (Your prompt has been saved.)`,
    };
  }
  switch (provider) {
    case 'ANTHROPIC': return callAnthropic(model, history);
    case 'GEMINI':    return callGemini(model, history);
    case 'GROQ':      return callGroq(model, history);
    case 'DEEPSEEK':  return callDeepseek(model, history);
  }
}

async function callAnthropic(model: string, history: ChatMessage[]): Promise<ChatResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const r = await client.messages.create({
    model: model || 'claude-opus-4-7',
    max_tokens: 2048,
    system: SYSTEM,
    messages: history.filter(m => m.role !== 'system').map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  });
  const text = r.content.map(c => c.type === 'text' ? c.text : '').join('');
  return { reply: text, inputTokens: r.usage?.input_tokens, outputTokens: r.usage?.output_tokens };
}

async function callGemini(model: string, history: ChatMessage[]): Promise<ChatResult> {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const g = client.getGenerativeModel({ model: model || 'gemini-2.0-flash-exp', systemInstruction: SYSTEM });
  const last = history[history.length - 1];
  const prior = history.slice(0, -1).filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const chat = g.startChat({ history: prior });
  const r = await chat.sendMessage(last.content);
  const text = r.response.text();
  const usage = r.response.usageMetadata;
  return { reply: text, inputTokens: usage?.promptTokenCount, outputTokens: usage?.candidatesTokenCount };
}

async function callGroq(model: string, history: ChatMessage[]): Promise<ChatResult> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const r = await client.chat.completions.create({
    model: model || 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: SYSTEM }, ...history.map(m => ({ role: m.role, content: m.content }))],
    max_tokens: 2048,
  });
  const text = r.choices[0]?.message?.content || '';
  return { reply: text, inputTokens: r.usage?.prompt_tokens, outputTokens: r.usage?.completion_tokens };
}

async function callDeepseek(model: string, history: ChatMessage[]): Promise<ChatResult> {
  const client = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: 'https://api.deepseek.com' });
  const r = await client.chat.completions.create({
    model: model || 'deepseek-chat',
    messages: [{ role: 'system', content: SYSTEM }, ...history.map(m => ({ role: m.role, content: m.content }))],
    max_tokens: 2048,
  });
  const text = r.choices[0]?.message?.content || '';
  return { reply: text, inputTokens: r.usage?.prompt_tokens, outputTokens: r.usage?.completion_tokens };
}
