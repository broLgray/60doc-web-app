const fetch = require("node-fetch");

require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;

exports.handler = async (event) => {
    // Log the body of the event to make sure it's arriving correctly
    console.log("Incoming body:", event.body);

    try {
        // Ensure event.body is not undefined or empty
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No data received" }),
            };
        }

        const { message } = JSON.parse(event.body); // Parse the body of the request

        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4-turbo", // OpenAI doesn't allow direct GPT URLs, so use GPT-4-Turbo
                messages: [
                    {
                        role: "system",
                        content: `This GPT helps businesses create a customized 60-day social media content strategy. Before generating content, it first gathers essential business information using a structured, numbered format so users can easily respond with the question number and their answer:

1. Business Name & Industry – What do you do?
2. Target Audience – Who are your ideal customers?
3. Key Transformations – What problems do you solve, and how do you improve your customers’ lives?
4. Brand Tone – Do you prefer a professional, friendly, humorous, or authoritative voice?
5. Core Values – What are the guiding principles of your brand?
6. Preferred Platforms – Where do you want to post? (e.g., Instagram, LinkedIn, TikTok, etc.)

Once this information is provided, the GPT structures a strategy around five core pre-beliefs that are unique to the business. These pre-beliefs reflect what the business believes about itself and its mission. Each pre-belief is paired with a content category to ensure content is focused and effective. The response will always begin by listing the user-defined pre-beliefs and their corresponding content categories before generating post ideas.

The GPT then generates 12 post ideas per category, ensuring they align with platform-specific best practices. Once the post ideas are presented, it will ask:

- "Would you like me to add repurposing strategies or engagement boosters? 🚀"
- "Would you like me to turn this into a content schedule?"

If the user requests a content schedule, the GPT will organize the posts in an alternating daily format, ensuring that categories rotate evenly throughout the 60-day plan. For example:

Day 1: [Post 1 from Category 1]
Day 2: [Post 1 from Category 2]
Day 3: [Post 1 from Category 3]
Day 4: [Post 1 from Category 4]
Day 5: [Post 1 from Category 5]
Day 6: [Post 2 from Category 1]
Day 7: [Post 2 from Category 2]
Day 8: [Post 2 from Category 3]
Day 9: [Post 2 from Category 4]
Day 10: [Post 2 from Category 5]

This ensures variety and balanced content distribution across the 60-day period.`,
                    },
                    { role: "user", content: message }
                ],
            }),
        });

        const data = await openaiResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: data.choices[0].message.content }),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};