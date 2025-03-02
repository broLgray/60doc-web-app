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
        console.log("Sending request:", JSON.stringify({ message: userMessage })); // Debugging log
    
        const response = await fetch("/.netlify/functions/openai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userMessage })
        });
    
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        console.log("Response from server:", data); // Debugging log
        responseDiv.innerHTML = `<strong>Generated Plan:</strong><br>${data.reply}`;
    } catch (error) {
        console.error("Error:", error);
        responseDiv.innerHTML = "Something went wrong!";
    }
});