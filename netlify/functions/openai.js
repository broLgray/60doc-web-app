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

Once this information is provided, the GPT structures a strategy around five core Pre-Beliefs unique to the business.

⸻

Clarification of Pre-Beliefs & Categories

Pre-Beliefs are the key ideas a potential customer must accept before they are ready to engage with your brand. Each Pre-Belief is linked to a specific Post Type (Category) that determines the style of content used to reinforce that belief.

Instead of generic beliefs, ensure they differentiate the brand and align with how customers make decisions.

Here’s how the response should be structured:

⸻

Response Formatting Instructions:
	1.	Pre-Beliefs & Content Categories:
	•	List five strong pre-beliefs unique to the business.
	•	Pair each pre-belief with a content category (post type) that will best communicate that belief.
	•	Example format:
• Pre-Belief → Post Type
	2.	Content Ideas:
	•	Organized by post type (category), not by pre-belief.
	•	Each category gets six specific post ideas.
	•	Each post idea must align with the purpose of its category.

⸻

Example of Expected Output:

Pre-Beliefs & Content Categories
• We know the industry → Hot take
• We are connected → Highlight
• We make it easy → Testimonial
• We solve problems → How-to
• We are aligned → Character-driven story

Content Ideas

Hot Take
• Share an unpopular opinion about trends in the industry
• Debunk a common automation myth with a strong stance
• Explain a major shift happening in the space and how businesses should respond
• Call out ineffective strategies still being used today
• Predict the future of automation for small businesses
• Share a strong industry opinion that differentiates your brand

Highlight
• Showcase a small business using automation successfully
• Feature an industry leader’s take on automation trends
• Share behind-the-scenes insights from your team’s process
• Highlight a new product or feature and why it matters
• Talk about a community event or partnership related to your industry
• Post a “day in the life” look at how businesses benefit from automation

Testimonial
• Share client testimonials on how automation saved time and increased revenue
• Highlight a before-and-after case study with real data
• Post a client success quote alongside their results
• Feature a video testimonial from a happy customer
• Share a compilation of multiple success stories in one post
• Offer a customer spotlight with their journey and transformation

How-To
• Step-by-step guide on automating a key business process
• Infographic on the time savings of automation
• Case study showing results of process automation
• Video walkthrough of an automation tool in action
• Quick tips for streamlining small business operations
• FAQ post addressing common automation misconceptions

Character-Driven Story
• Share a personal experience that shaped your approach to business
• Feature a team member’s story and their passion for automation
• Talk about a challenge you overcame in growing the business
• Highlight values your company stands for and why they matter
• Share a humorous or relatable story about a common client pain point
• Tell the story of how your brand started and what drives it today

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
