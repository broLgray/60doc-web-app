const fetch = require("node-fetch");
require('dotenv').config();
const fs = require('fs'); // File system for logging

const apiKey = process.env.OPENAI_API_KEY;

exports.handler = async (event) => {
    console.log("Incoming request:", event.body); // Log incoming request data

    try {
        if (!event.body) {
            console.error("Error: No data received");
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "No data received" }),
            };
        }

        const { message } = JSON.parse(event.body);

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
                        content: `You are an AI marketing assistant. Generate a structured **30-day social media content plan** based on the user's business details. 

### **Formatting Rules**
- **Do not** ask any follow-up questions at the end.
- Use **Markdown-style formatting** for readability.
- Organize content into two main sections:
  1. **Pre-Beliefs & Content Categories** (a short list of the business’s core beliefs and their associated content types).
  2. **Content Ideas** (categorized post ideas using bullet points).
- Use **section headers (## or ###)** for better readability.
- Use bullet points (✅) for content ideas.
- Maintain **line spacing** for easy reading.

### **Example Response Format**  
---

## **Generated 30-Day Content Plan**  

### **Pre-Beliefs & Content Categories**  
📌 **Reliability** → *Educational Content*  
📌 **Innovation** → *Product Showcase*  
📌 **Scalability** → *Client Testimonials*  
📌 **Efficiency** → *Tips & Tricks*  
📌 **Security** → *Industry News*  

---

### **Content Ideas**  

#### **📚 Educational Content (Reliability)**  
✅ How regular maintenance prevents costly downtime.  
✅ Quick video guide: Fixing common Wi-Fi issues.  

#### **🚀 Product Showcase (Innovation)**  
✅ Introducing the latest wireless technology for offices.  
✅ Before & after: The impact of a network overhaul.  

#### **📢 Client Testimonials (Scalability)**  
✅ Video: A client shares how your IT solutions helped them scale.  
✅ Case study: Customizing IT infrastructure for business growth.  

#### **⚡ Tips & Tricks (Efficiency)**  
✅ Quick tip: Boosting network speed for better office performance.  
✅ Remote teams: A productivity hack for IT efficiency.  

#### **🔒 Industry News (Security)**  
✅ Cybersecurity threats: What businesses should know right now.  
✅ Video: Why VPNs are essential for remote work security.  

---
Ensure the response follows this format exactly. Now, generate a response using the user's business details.`
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
        .replace(/\n- /g, "<li>") // Convert bullet points into list items
        .replace(/\n/g, "<br>"); // Preserve line breaks

    return `<div style="text-align: left;">${formattedText}</div>`;
}