import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import { deepseek } from '@/lib/deepseek';
import { buildPdfExtractionPrompt } from '@/lib/prompts';
import { RawExpenseInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured. PDF parsing requires AI to extract expenses.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF too large. Maximum file size is 20MB.' }, { status: 400 });
    }

    // Extract text from PDF using pdf-parse v2
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const pdf = new PDFParse({ data });
    const textResult = await pdf.getText();
    await pdf.destroy();

    if (!textResult.text?.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The file may be image-based or empty.' },
        { status: 422 }
      );
    }

    // Truncate to stay within token limits (~8000 chars)
    const truncatedText = textResult.text.slice(0, 8000);

    // Send to DeepSeek AI to structure the text into expenses
    const { system, user } = buildPdfExtractionPrompt(truncatedText);

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    const expenses: RawExpenseInput[] = (parsed.expenses || [])
      .filter((e: Record<string, unknown>) => e.description && e.amount)
      .map((e: Record<string, unknown>) => ({
        description: String(e.description).trim(),
        amount: Math.abs(parseFloat(String(e.amount))) || 0,
        date: typeof e.date === 'string' ? e.date : new Date().toISOString().slice(0, 10),
        category: typeof e.category === 'string' ? e.category.toLowerCase().trim() : undefined,
        notes: typeof e.notes === 'string' ? e.notes : undefined,
      }))
      .filter((e: RawExpenseInput) => e.amount > 0 && e.description.length > 0);

    return NextResponse.json({
      expenses,
      errors: [],
      totalRows: expenses.length,
      fileType: 'pdf',
    });
  } catch (error) {
    console.error('PDF parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF. Please try a different file or format.' },
      { status: 500 }
    );
  }
}
