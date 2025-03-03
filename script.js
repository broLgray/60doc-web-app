document.getElementById("contentForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevents page refresh on submit

    const business = document.getElementById("business").value;
    const audience = document.getElementById("audience").value;
    const transformations = document.getElementById("transformations").value;
    const tone = document.getElementById("tone").value;
    const values = document.getElementById("values").value;

    // Collect selected platforms
    const selectedPlatforms = [];
    document.querySelectorAll(".checkbox-group input:checked").forEach(checkbox => {
        selectedPlatforms.push(checkbox.value);
    });

    // Format user input into a structured message
    const userMessage = `
        Business Name & Industry: ${business}
        Target Audience: ${audience}
        Key Transformations: ${transformations}
        Brand Tone: ${tone}
        Core Values: ${values}
        Preferred Platforms: ${selectedPlatforms.join(", ")}
    `;

    const responseDiv = document.getElementById("response");
    responseDiv.innerHTML = `Generating your content plan <span class="loading"></span>`;

    try {
        console.log("🔵 Sending request to server:", JSON.stringify({ message: userMessage }));

        const response = await fetch("/.netlify/functions/openai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("🟢 Response from server:", data);

        responseDiv.innerHTML = `<strong>Generated Plan:</strong><br>${data.reply}`;

        // Call sendHeight after response to adjust iframe height
        sendHeight();
    } catch (error) {
        console.error("🔴 Error:", error);

        let errorMessage = "Something went wrong!";
        if (error.message.includes("Failed to fetch")) {
            errorMessage = "Network error: Unable to reach the server. Check your connection.";
        } else if (error.message.includes("500")) {
            errorMessage = "Server error: OpenAI function crashed.";
        } else if (error.message.includes("400")) {
            errorMessage = "Bad request: Missing or incorrect data.";
        }

        responseDiv.innerHTML = `<span style="color: red;">${errorMessage}</span>`;

        // Adjust iframe even if an error occurs
        sendHeight();
    }
});

// ✅ Move this function OUTSIDE the submit event so it runs on load & resize
function sendHeight() {
    const height = document.body.scrollHeight; // Get total page height
    window.parent.postMessage({ type: "resize", height }, "*");
}

// Send height updates after page loads and when window resizes
window.addEventListener("load", sendHeight);
window.addEventListener("resize", sendHeight);