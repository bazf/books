import { Book } from '../types';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface StructuredPageContent {
  chapterTitle?: string;
  content: Array<{
    type: 'paragraph' | 'heading' | 'list' | 'table' | 'blockquote';
    level?: number;
    content: string;
    items?: string[];
    rows?: string[][];
  }>;
}

export async function analyzeImage(
  apiKey: string, 
  imageData: string, 
  book?: Book
): Promise<string> {
  let contextText = '';
  if (book && book.pages.length > 0) {
    const previousPage = book.pages[book.currentPage];
    if (previousPage) {
      const content = previousPage.content;
      const lastParagraphMatch = content.match(/[^\n]+$/);
      contextText = lastParagraphMatch 
        ? lastParagraphMatch[0]
        : content.slice(-200);
    }
  }

  const targetLanguage = book?.settings?.translationLanguage;
  const languagePrompt = targetLanguage 
    ? `Extract the text from the image and translate it into ${targetLanguage}.

Instructions for translation:
1. Provide a natural, idiomatic translation that sounds native in ${targetLanguage}
2. Adapt measurements according to these rules:
   - For Ukrainian, German, French, Polish, Italian: Convert to metric system
     * inches → centimeters (multiply by 2.54)
     * feet → meters (multiply by 0.3048)
     * yards → meters (multiply by 0.9144)
     * miles → kilometers (multiply by 1.60934)
     * pounds → kilograms (multiply by 0.45359)
     * ounces → grams (multiply by 28.3495)
     * Fahrenheit → Celsius ((°F - 32) × 5/9)
   - For US English: Keep imperial measurements
   - Round converted values appropriately for readability
3. Adapt cultural references and idioms to be understood by ${targetLanguage} speakers
4. Follow proper grammar, punctuation, and capitalization rules for ${targetLanguage}
5. Maintain the original text's tone and formality level
6. Preserve any technical terminology appropriately

Provide ONLY the translated content with adapted measurements, no original text.`
    : 'Extract and format the text from this image in its original language.';

  const prompt = `
${languagePrompt}

Return a structured JSON response with the following format:
{
  "chapterTitle": "optional chapter title if detected",
  "content": [
    {
      "type": "heading" | "paragraph" | "list" | "table" | "blockquote",
      "level": number (1-6, for headings only),
      "content": "text content",
      "items": ["array of items for lists only"],
      "rows": [["array of arrays for table cells only"]]
    }
  ]
}

Rules:
1. Detect and preserve the document structure
2. For lists, split items into the "items" array
3. For tables, organize cells into the "rows" array
4. Recognize chapter titles and headings
5. Preserve paragraph breaks
6. If content appears to continue from this context, ensure proper flow:
${contextText}

Return valid JSON that matches the specified structure exactly.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageData.split(',')[1]
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json"
        }
      })
    }
  );

  const data: GeminiResponse = await response.json();
  
  if (!response.ok || !data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }

  try {
    const structuredContent: StructuredPageContent = JSON.parse(
      data.candidates[0].content.parts[0].text
    );
    return convertToHtml(structuredContent);
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Invalid JSON response from Gemini API');
  }
}

function convertToHtml(structuredContent: StructuredPageContent): string {
  let html = '';
  
  if (structuredContent.chapterTitle) {
    html += `<h1 class="text-2xl font-bold mb-4">${structuredContent.chapterTitle}</h1>\n`;
  }

  for (const block of structuredContent.content) {
    switch (block.type) {
      case 'heading':
        html += `<h${block.level} class="text-xl font-semibold my-4">${block.content}</h${block.level}>\n`;
        break;
      
      case 'paragraph':
        html += `<p class="mb-4">${block.content}</p>\n`;
        break;
      
      case 'list':
        if (block.items?.length) {
          html += '<ul class="list-disc pl-6 mb-4">\n';
          block.items.forEach(item => {
            html += `  <li class="mb-2">${item}</li>\n`;
          });
          html += '</ul>\n';
        }
        break;
      
      case 'table':
        if (block.rows?.length) {
          html += '<table class="w-full border-collapse mb-4">\n';
          block.rows.forEach(row => {
            html += '  <tr>\n';
            row.forEach(cell => {
              html += `    <td class="border p-2">${cell}</td>\n`;
            });
            html += '  </tr>\n';
          });
          html += '</table>\n';
        }
        break;
      
      case 'blockquote':
        html += `<blockquote class="border-l-4 border-gray-300 pl-4 my-4">${block.content}</blockquote>\n`;
        break;
    }
  }

  return html;
}