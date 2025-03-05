// Generate a story based on the given theme
async function generateStoryPrompt(theme, numSlides) {
  try {
    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a creative storyteller who specializes in creating cartoon-style stories for children. 
                   You will generate a ${numSlides}-panel cartoon story based on a theme.
                   Create a well-structured story with a beginning, middle, and end.
                   The output should be in JSON format with an array of slide descriptions.
                   Each slide should have a vivid, detailed description that can be turned into an image.`
        },
        {
          role: "user",
          content: `Create a ${numSlides}-panel cartoon story based on the theme: "${theme}".
                   Return ONLY a JSON object with the following structure:
                   {
                     "title": "The story title",
                     "slides": [
                       {
                         "description": "Detailed description of slide 1 scene",
                         "caption": "Short caption or dialogue for slide 1"
                       },
                       ... (repeat for all ${numSlides} slides)
                     ]
                   }`
        }
      ],
      json: true
    });
    
    return JSON.parse(completion.content);
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
}

