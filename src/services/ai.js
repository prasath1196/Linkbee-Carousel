import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = (apiKey) => {
    if (!apiKey) throw new Error("API Key is missing");
    return new GoogleGenerativeAI(apiKey);
};

// Helper to standardise the response and extract usage metadata
const processResponse = (result) => {
    const response = result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    const usage = response.usageMetadata; // { promptTokenCount, candidatesTokenCount, totalTokenCount }

    return {
        content: text,
        usage: usage
    };
};

export const generateStructure = async (topic, apiKey) => {
    try {
        const genAI = getClient(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Act as a presentation expert.
            
            INPUT:
            "${topic}"
            
            TASK:
            Analyze the input above. 
            - If it is a simple topic, brainstorm a structured outline.
            - If it is long-form content (blog/article), summarize the KEY points into a structured outline.
            
            Requirements:
            - 5 to 7 slides maximum.
            - Logical flow (Hook -> Problem -> Solution -> Examples -> CTA).
            - Return JSON ONLY (Array of objects).
            
            Schema:
            [
                { "id": 1, "title": "Hook / Title Slide", "purpose": "Grab attention" },
                { "id": 2, "title": "Main Point", "purpose": "Explain the concept" }
            ]
        `;

        const result = await model.generateContent([prompt]);
        const { content, usage } = processResponse(result);

        return {
            data: JSON.parse(content),
            usage
        };
    } catch (error) {
        console.error("Structure API Error:", error);
        throw error;
    }
};


export const generateSlideContent = async (structure, apiKey) => {
    try {
        const genAI = getClient(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are a viral LinkedIn Carousel expert.
            Create content for a ${structure.length}-slide carousel about: "${structure[0].title}" (context: the whole outline).

            CRITICAL RULES:
            1.  **Brevity is King**: Max 10 words per bullet point. Max 3 bullet points per slide.
            2.  **No Fluff**: Remove intro words like "Unlock...", "Discover...". Go straight to the insight.
            3.  **Visuals**: Describe a minimalist, abstract visual metaphor for each slide.
            4.  **Formatting**: Use **bold** for keywords.
            5.  **Voice**: Professional but punchy.

            Output strictly valid JSON:
            [
                {
                    "title": "Slide Title (Max 6 words)",
                    "content": ["Short punchy point 1", "Short point 2 (bold keywords)"],
                    "visual": "Description of visual"
                }
            ]
        `;

        const result = await model.generateContent([prompt]);
        const { content, usage } = processResponse(result);

        return {
            data: JSON.parse(content),
            usage
        };
    } catch (error) {
        console.error("Content API Error:", error);
        throw error;
    }
};


export const regenerateSingleSlide = async (currentSlide, topic, apiKey) => {
    try {
        const genAI = getClient(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Context: A LinkedIn carousel about "${topic}".
            
            Task: Rewrite the following slide to be more viral, punchy, and clear.
            
            Current Draft Title: "${currentSlide.title}"
            Current Draft Content: ${JSON.stringify(currentSlide.content)}
            Current Visual Idea: "${currentSlide.visual}"
            
            Output: JSON Object ONLY (no markdown).
            Schema: { "title": "string", "content": ["string", "string"], "visual": "string" }
        `;

        const result = await model.generateContent([prompt]);
        const { content, usage } = processResponse(result);

        return {
            data: JSON.parse(content),
            usage
        };
    } catch (error) {
        console.error("Slide Regen Error:", error);
        throw error;
    }
};

export const expandBulletPoint = async (bulletText, slideTitle, topic, apiKey) => {
    try {
        const genAI = getClient(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Context: Presentation on "${topic}". Slide Title: "${slideTitle}".
            
            Task: Improve this specific bullet point. Make it punchier, insightful, and under 15 words.
            Input Bullet: "${bulletText}"
            
            Output: Just the plain text string. No quotes, no JSON.
        `;

        const result = await model.generateContent([prompt]);
        const { content, usage } = processResponse(result);

        return {
            data: content, // Raw text
            usage
        };
    } catch (error) {
        console.error("Bullet Expand Error:", error);
        return { data: bulletText, usage: null }; // Return original on fail
    }
};
