const form = document.getElementById("feedbackForm");
const submitBtn = document.getElementById("submitBtn");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.className = "message";
    messageDiv.textContent = "";

    const name     = document.getElementById("name").value;
    const email    = document.getElementById("email").value;
    const feedback = document.getElementById("feedback").value;

    // FIX 2: Disable button immediately to prevent double-submit
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
    const res = await fetch("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, feedback }),
    });

    const data = await res.json();

    if (data.success) {
        messageDiv.textContent = data.message;
        messageDiv.className = "message success";
        form.reset();
    } else {
        messageDiv.textContent = data.error;
        messageDiv.className = "message error";
    }
    } catch (err) {
    // Handles server down / network failure
    messageDiv.textContent = "Could not reach the server. Please try again later.";
    messageDiv.className = "message error";
    } finally {
    // Re-enable button after response
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Feedback";
    }
});
