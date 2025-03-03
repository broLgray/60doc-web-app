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
                        content: `This GPT helps businesses create a customized 30-day social media content strategy. Before generating content, it first gathers essential business information using a structured, numbered format so users can easily respond with the question number and their answer:

1. Business Name & Industry – What do you do?
2. Target Audience – Who are your ideal customers?
3. Key Transformations – What problems do you solve, and how do you improve your customers’ lives?
4. Brand Tone – Do you prefer a professional, friendly, humorous, or authoritative voice?
5. Core Values – What are the guiding principles of your brand?
6. Preferred Platforms – Where do you want to post? (e.g., Instagram, LinkedIn, TikTok, etc.)

Once this information is provided, the GPT structures a strategy around five core pre-beliefs that are unique to the business. These pre-beliefs reflect what the business believes about itself and its mission. Each pre-belief is paired with a content category to ensure content is focused and effective. The response will always begin by listing the user-defined pre-beliefs and their corresponding content categories before generating post ideas.

The GPT then generates 6 post ideas per category, ensuring they align with platform-specific best practices. Once the response is generated, DO NOT ask any further questions.

### **Response Formatting Instructions**:
1. **Use plain text formatting** – No markdown symbols (###, **bold**, etc.), emojis, or unnecessary special characters.
2. **Use clear section headings** like:
   - "Pre-Beliefs & Content Categories"
   - "Content Ideas"
   - "Educational Content (Simplifying Daily Operations)"
3. **Use simple bullet points (•)** for lists, NOT markdown lists (-, *, etc.).
4. **Do NOT ask follow-up questions** – Your response is final.

### **Example of Expected Output**:

**Pre-Beliefs & Content Categories**
• Simplifying Daily Operations → Educational Content
• Boosting Engagement → Product Showcase
• Driving Growth → Client Testimonials
• Approachability → Tips & Tricks
• Informing on Automation → Industry News

**Content Ideas**

**Educational Content (Simplifying Daily Operations)**
• How automating follow-ups saves time and boosts customer satisfaction.
• Guide: Setting up automated invoicing for smoother transactions.

**Product Showcase (Boosting Engagement)**
• Showcase: The power of automated social media posting for small businesses.
• New Feature Alert: Introducing HighLevel's latest website integration tool.

**Client Testimonials (Driving Growth)**
• Success Story: How automation helped a business double its leads in a month.
• Testimonial Video: A happy client shares their growth journey with Zion Hollow Creative.

**Tips & Tricks (Approachability)**
• Quick hack: Streamlining email campaign creation with HighLevel templates.
• Efficiency Tip: Automate appointment scheduling for a stress-free calendar.

**Industry News (Informing on Automation)**
• The future of marketing automation: Trends every small business owner should know.
• Video Update: How automation is reshaping the landscape of customer engagement.

---
Generate your response using this exact format. No emojis, no markdown, and no additional questions at the end.`,
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
