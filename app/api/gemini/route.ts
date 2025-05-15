import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, options, correctAnswer, userAnswer } = body;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API });

    // Function to detect if text contains Hindi
    const containsHindi = (text: string) => {
      // Hindi Unicode range: \u0900-\u097F
      return /[\u0900-\u097F]/.test(text);
    };

    // Determine language based on question content
    const isHindi = containsHindi(question);

    // Format the prompt for Gemini with language-specific instructions
    const prompt = `
      ${
        isHindi
          ? "इस प्रश्न का विश्लेषण करें और नीचे दिखाए गए सटीक प्रारूप में व्याख्या प्रदान करें:"
          : "Analyze this question and provide explanation in the exact format shown below:"
      }


      Question:
      ${question}


      Options:
      ${options.map((option: any) => `- ${option.text}`).join("\n")}


      Correct Answer: ${correctAnswer}
      ${userAnswer ? `User's Answer: ${userAnswer}` : "User did not answer"}


      ${
        isHindi
          ? "कृपया अपना जवाब बिल्कुल इसी प्रारूप में हिंदी में प्रदान करें:"
          : "Please provide your response in exactly this format in English:"
      }


      **Correct Answer**: ${correctAnswer}




      **${isHindi ? "व्याख्या" : "Explanation"}**:
      ${
        isHindi
          ? "[विस्तृत व्याख्या प्रदान करें। बताएं कि यह सही उत्तर क्यों है और अन्य विकल्प गलत क्यों हैं। सरल भाषा का प्रयोग करें लेकिन शब्द सीमा नहीं है।]"
          : "[Provide a detailed explanation here. Explain why this is the correct answer and why other options are incorrect. Use simple language but no word limit.]"
      }




      **${isHindi ? "मुख्य बिंदु" : "Key Points"}**:
      ${
        isHindi
          ? "[इस प्रश्न से 2-3 महत्वपूर्ण सीख या अवधारणाएं लिखें]"
          : "[List 2-3 key takeaways or important concepts from this question]"
      }




      **${isHindi ? "सामान्य गलतियां" : "Common Mistakes"}**:
      ${
        isHindi
          ? "[यदि लागू हो, तो छात्रों द्वारा की जाने वाली सामान्य गलतियों या भ्रांतियों की व्याख्या करें]"
          : "[If applicable, explain common misconceptions or why students might choose wrong options]"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return Response.json({ explanation: response.text });
  } catch (error) {
    console.error("Explain API error:", error);

    return Response.json(
      { error: "Failed to get explanation from Gemini API" },
      { status: 500 },
    );
  }
}
