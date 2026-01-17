import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";






const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});




export async function POST(req:Request) {
  try{
    const body=await req.json();

    const{score,total,percentage,testTitle, difficulty }=body;

    const prompt = `
      You are an AI career coach.

      Analyze the test performance and give helpful feedback.

      Rules:
      - Be concise
      - Use simple English
      - Give actionable suggestions
      - No markdown

      Test: ${testTitle ?? "Unknown Test"}
      Difficulty: ${difficulty ?? "Unknown"}
      Score: ${score ?? 0}/${total ?? 0}
      Percentage: ${percentage ?? 0}%

      Give feedback in this JSON format ONLY:
      {
        "summary": "",
        "strengths": "",
        "improvements": "",
        "advice": ""
      }
    `;


  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents:prompt,
  });



  const text = response.text ?? "{}";


    let feedback: {
      summary: string;
      strengths: string;
      improvements: string;
      advice: string;
    };

    try {
      feedback = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse AI feedback:", err, "Text:", text);
      feedback = {
        summary: "Could not generate feedback",
        strengths: "",
        improvements: "",
        advice: "",
      };
    }

    // Return successful response
    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("AI feedback API error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}