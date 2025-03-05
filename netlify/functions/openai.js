const fetch = require("node-fetch");
require('dotenv').config();
const fs = require('fs'); // File system for logging

const apiKey = process.env.OPENAI_API_KEY;

exports.handler = async (event) => {
    console.log("Incoming request:", event.body); // Log incoming request data

    try {
        // Ensure the request has a body
        if (!event.body) {
            console.error("Error: No data received");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No data received" }),
            };
        }

        const { message } = JSON.parse(event.body); // Parse request body

        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Use the cheaper and faster GPT-3.5-Turbo model
                messages: [
                    {
                        role: "system",
                        content: `This GPT helps businesses create a customized 30-day social media content strategy. Before generating content, it gathers essential business information using a structured, numbered format so users can easily respond with the question number and their answer:
	1.	Business Name & Industry – What do you do?
	2.	Target Audience – Who are your ideal customers?
	3.	Key Transformations – What problems do you solve, and how do you improve your customers’ lives?
	4.	Brand Tone – Do you prefer a professional, friendly, humorous, or authoritative voice?
	5.	Core Values – What are the guiding principles of your brand?
	6.	Preferred Platforms – Where do you want to post? (e.g., Instagram, LinkedIn, TikTok, etc.)

Once this information is provided, the GPT structures a strategy around five core Pre-Beliefs unique to the business. Each pre-belief is paired with a Content Category to ensure all content is focused and effective.

Pre-Beliefs are the core ideas your ideal audience needs to accept before they are ready to engage with your brand, subscribe, or buy. These are the “mental dominoes” that need to fall, making the decision a no-brainer for them. Each Pre-Belief connects to a specific Content Category, ensuring your content builds alignment and trust.

Instead of generic beliefs, focus on ones that truly differentiate the company's brand and reflect what matters most to your audience. Here are examples of strong Pre-Beliefs:

• We share the same values – People do business with brands they trust and align with. Content here might highlight culture, mission, or what your brand stands for.
• We know what we’re doing – Before someone buys, they need to believe you’re an expert. Content in this category could be hot takes, industry insights, or thought leadership.
• We make things easy – If people feel something is overwhelming, they won’t move forward. This category could feature testimonials, case studies, or clear “how-to” content.
• We solve a real problem – If people don’t believe they have a problem (or that you solve it better), they won’t engage. Content here might highlight pain points and transformations.
• We are different from competitors – Why should they pick you over alternatives? This could include your unique methods, personality, or what makes your brand stand out.

Important notes about pre-beliefs:
    1.	Ensure each Pre-Belief is clearly stated and connected to a unique Content Category. Avoid generic responses like “we provide value” or “we help businesses grow.” Instead, make them specific to the business.
	2.	Generate content ideas that align with each belief. Example: If the belief is “We make things easy,” posts should include testimonials, step-by-step guides, or simple explanations.
	3.	Format the response exactly as shown in the example. No markdown symbols, just plain text with line breaks for readability.

The response must follow this exact format and structure:

⸻

Response Formatting Instructions:
	1.	No markdown symbols (###, bold, *, -, etc.), emojis, or special characters.
	2.	Section headings must be in plain text with line breaks for clarity.
	3.	Use bullet points (•) for all lists.
	4.	No follow-up questions – The response should be final.

⸻

Example Response Format:

Pre-Beliefs & Content Categories
• Pre-Belief 1 → Category 1
• Pre-Belief 2 → Category 2
• Pre-Belief 3 → Category 3
• Pre-Belief 4 → Category 4
• Pre-Belief 5 → Category 5

Content Ideas

Category 1
• Post idea 1
• Post idea 2
• Post idea 3
• Post idea 4
• Post idea 5
• Post idea 6

Category 2
• Post idea 1
• Post idea 2
• Post idea 3
• Post idea 4
• Post idea 5
• Post idea 6

Category 3
• Post idea 1
• Post idea 2
• Post idea 3
• Post idea 4
• Post idea 5
• Post idea 6

Category 4
• Post idea 1
• Post idea 2
• Post idea 3
• Post idea 4
• Post idea 5
• Post idea 6

Category 5
• Post idea 1
• Post idea 2
• Post idea 3
• Post idea 4
• Post idea 5
• Post idea 6

⸻

Additional Notes:
	•	Ensure content ideas align with platform best practices.
	•	Keep responses concise and easy to read.
	•	Maintain the exact structure and avoid unnecessary explanations.`,
                    },
                    { role: "user", content: message }
                ],
            }),
        });

        if (!openaiResponse.ok) {
            const errorMessage = `OpenAI API error: ${openaiResponse.status} - ${await openaiResponse.text()}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        const data = await openaiResponse.json();
        console.log("API Response:", data);

        // Format response into readable HTML
        const formattedResponse = formatResponse(data.choices[0].message.content);

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: formattedResponse }),
        };
    } catch (error) {
        console.error("Error:", error);

        // Write error to a log file (optional)
        fs.appendFileSync("error.log", `${new Date().toISOString()} - ${error.stack}\n`);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
        };
    }
};

// Function to format AI response for better readability
function formatResponse(responseText) {
    let formattedText = responseText
        .replace(/\*\*(.*?)\*\*/g, "<h3>$1</h3>") // Convert **text** into <h3>
        .replace(/\d+\.\s/g, "<li>") // Convert numbered list into <li>
        .replace(/(?<=<\/li>)\s*/g, "</li>") // Close <li> tags properly
        .replace(/\n/g, "<br>"); // Preserve line breaks

    return `<div style="text-align: left;">${formattedText}</div>`;
}
