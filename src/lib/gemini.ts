export async function analyzeImage(apiKey: string, imageData: string): Promise<string> {
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
              { text: "Extract and format the text from this image, preserving paragraphs and structure." },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData.split(',')[1]
                }
              }
            ]
          }]
        })
      }
    );
  
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }