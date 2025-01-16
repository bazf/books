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
  shortName: string;
  content: Array<{
    type: 'paragraph' | 'heading' | 'list' | 'table' | 'blockquote';
    level?: number;
    content: string;
    items?: string[];
    rows?: string[][];
  }>;
  previousPageEnding?: string;
}

export async function analyzeImage(
  apiKey: string, 
  imageData: string, 
  book?: Book
): Promise<{ 
  newPageContent: string; 
  shortName: string;
  previousPageUpdate?: { 
    id: string; 
    content: string 
  } 
}> {
  let contextText = '';
  let previousPageId = '';
  let previousPageFullContent = '';
  
  if (book && book.pages.length > 0) {
    const previousPage = book.pages[book.currentPage];
    if (previousPage) {
      previousPageId = previousPage.id;
      previousPageFullContent = previousPage.content;
      // Updated regex to handle multiple classes and potential whitespace
      const lastParagraphMatch = previousPageFullContent.match(/<p[^>]*?>([^<]+)<\/p>\s*$/);
      if (lastParagraphMatch) {
        contextText = lastParagraphMatch[1].trim();
      } else {
        // If no paragraph tag is found, extract the last 200 characters of text content
        const textContent = previousPageFullContent.replace(/<[^>]+>/g, ' ').trim();
        contextText = textContent.slice(-200);
      }
    }
  }

  const targetLanguage = book?.settings?.translationLanguage;
  const languagePrompt = targetLanguage 
    ? `Extract the text from the image and translate it into ${targetLanguage}.

Instructions for translation:
1. Do NOT add any titles or headings that are not present in the original text
2. Maintain the exact same document structure as the original text
3. Provide a natural, idiomatic translation that sounds native in ${targetLanguage}
4. Create a concise 2-3 word description of the main topic or content of the page for the shortName field
5. The shortName should be clear and descriptive, avoiding generic terms like "Page Content" or "Text Section"
6. Adapt measurements according to these rules:
   - For Ukrainian, German, French, Polish, Italian: Convert to metric system
     * inches → centimeters (multiply by 2.54)
     * feet → meters (multiply by 0.3048)
     * yards → meters (multiply by 0.9144)
     * miles → kilometers (multiply by 1.60934)
     * pounds → kilograms (multiply by 0.45359)
     * ounces → grams (multiply by 28.3495)
     * Fahrenheit → Celsius ((°F - 32) × 5/9)
   - For US English: Keep imperial measurements
7. Adapt cultural references and idioms to be understood by ${targetLanguage} speakers
8. Follow proper grammar, punctuation, and capitalization rules for ${targetLanguage}
9. Maintain the original text's tone and formality level
10. Preserve any technical terminology appropriately

Previous page ending: "${contextText}"

If needed, provide an updated version of this ending that will flow smoothly into the new content.`
    : `Extract and format the text from this image in its original language.
Please provide a concise 2-3 word description of the main topic or content in the shortName field.
The shortName should be clear and descriptive, avoiding generic terms.`;

  const prompt = `${languagePrompt}

You must return a valid JSON object that matches the provided schema exactly.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
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
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              chapterTitle: {
                type: "string",
                description: "Optional chapter title, ONLY if it exists in the original text. Do not create new titles."
              },
              shortName: {
                type: "string",
                description: "A brief 2-3 word description of the page content"
              },
              content: {
                type: "array",
                description: "Array of content blocks",
                items: {
                  type: "object",
                  required: ["type", "content"],
                  properties: {
                    type: {
                      type: "string",
                      enum: ["heading", "paragraph", "list", "table", "blockquote"],
                      description: "Type of content block"
                    },
                    level: {
                      type: "number",
                      description: "Heading level (1-6), only for heading type"
                    },
                    content: {
                      type: "string",
                      description: "Text content"
                    },
                    items: {
                      type: "array",
                      items: { type: "string" },
                      description: "Array of list items, only for list type"
                    },
                    rows: {
                      type: "array",
                      items: {
                        type: "array",
                        items: { type: "string" }
                      },
                      description: "Array of table rows, only for table type"
                    }
                  }
                }
              },
              previousPageEnding: {
                type: "string",
                description: "Optional modified version of the previous page ending for smooth transition"
              }
            },
            required: ["content", "shortName"]
          }
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
    
    // Ensure partial list items are included
    if (previousPageFullContent && previousPageFullContent.includes('<li') && !previousPageFullContent.includes('</li>')) {
      // If previous page ends with an incomplete list item, include it in the new content
      const partialListItem = previousPageFullContent.match(/<li[^>]*>([^<]+)$/)?.[1] || '';
      if (partialListItem && structuredContent.content[0]?.type !== 'list') {
        structuredContent.content.unshift({
          type: 'list',
          items: [partialListItem]
        });
      }
    }
    
    const newPageHtml = convertToHtml(structuredContent);
    
    if (previousPageId && structuredContent.previousPageEnding) {
      // Updated to handle multiple paragraph classes and ensure proper structure
      const lastParagraphRegex = /(<p[^>]*?>)[^<]+(<\/p>)\s*$/;
      const updatedPreviousContent = previousPageFullContent.replace(
        lastParagraphRegex,
        `$1${structuredContent.previousPageEnding}$2`
      );
      
      return {
        newPageContent: newPageHtml,
        shortName: structuredContent.shortName,
        previousPageUpdate: updatedPreviousContent !== previousPageFullContent ? {
          id: previousPageId,
          content: updatedPreviousContent
        } : undefined
      };
    }
    
    return { 
      newPageContent: newPageHtml,
      shortName: structuredContent.shortName
    };
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Invalid JSON response from Gemini API');
  }
}

function convertToHtml(structuredContent: StructuredPageContent): string {
  // Initialize with any ongoing list if needed
  let html = '';
  let isListOpen = false;
  
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
        const content = block.content || block.items?.join('\n');
        if (content) {
          if (!isListOpen) {
            html += '<ul class="list-disc pl-6 mb-4">\n';
            isListOpen = true;
          }
          // Handle both single content string and array of items
          if (block.content) {
            // Split content by newlines and filter out empty items
            const items = block.content
              .split('\n')
              .map(item => item.trim())
              .filter(item => item && item !== '•'); // Filter out empty items and lone bullet points
              
            items.forEach(item => {
              html += `  <li class="mb-2">${item.replace(/^[•\-\*]\s*/, '')}</li>\n`;
            });
          } else if (block.items) {
            const filteredItems = block.items.filter(item => item.trim()); // Filter out empty items
            filteredItems.forEach(item => {
              html += `  <li class="mb-2">${item}</li>\n`;
            });
          }
          
          // Check if this is the last block and the content appears incomplete
          const isLastBlock = block === structuredContent.content[structuredContent.content.length - 1];
          const isIncomplete = content.trim().slice(-1) !== '.';
          
          if (isLastBlock && isIncomplete) {
            isListOpen = true;
          } else {
            html += '</ul>\n';
            isListOpen = false;
          }
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

  // Ensure there's no trailing whitespace
  return html.trim();
}