// Generate cartoon image based on description
async function generateCartoonImage(description, style) {
  try {
    // First, enhance the image prompt to make it more cartoon-like
    const enhancedPrompt = await enhanceImagePrompt(description, style);
    
    // Then generate the actual image
    const result = await websim.imageGen({
      prompt: enhancedPrompt,
      aspect_ratio: "4:3"
    });
    
    return result.url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Enhance the image prompt with LLM for better cartoon results
async function enhanceImagePrompt(description, style) {
  try {
    const completion = await websim.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert at creating prompts for AI image generators. 
                   You specialize in creating detailed prompts that result in high-quality cartoon images.
                   Take the provided description and enhance it to create a prompt that will generate a 
                   cartoon image in the specified style.`
        },
        {
          role: "user",
          content: `Enhance this description to create a prompt for generating a cartoon image:
                  
                   Description: "${description}"
                   
                   Style: "${style || 'Modern cartoon'}"
                   
                   Return ONLY the enhanced prompt text with no additional text, quotes or explanations.
                   Include visual cues about lighting, perspective, and mood.
                   Specify the cartoon style details.`
        }
      ]
    });
    
    return completion.content;
  } catch (error) {
    console.error("Error enhancing image prompt:", error);
    throw new Error("Failed to enhance image prompt: " + error.message);
  }
}

