document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants HTML (bulleted list or friendly placeholder)
        const participants = Array.isArray(details.participants) ? details.participants : [];

        // Base card content (participants appended below)
        activityCard.innerHTML = `
            <h4>${name}</h4>
            <p>${details.description}</p>
            <p><strong>Schedule:</strong> ${details.schedule}</p>
            <p class="availability"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          `;

        // Participants container
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";
        const h5 = document.createElement("h5");
        h5.textContent = "Participants";
        participantsDiv.appendChild(h5);

        if (participants.length > 0) {
          const ul = document.createElement("ul");

          participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const span = document.createElement("span");
            span.textContent = p;

            const btn = document.createElement("button");
            btn.className = "delete-btn";
            btn.type = "button";
            btn.title = `Unregister ${p}`;
            btn.setAttribute("aria-label", `Unregister ${p}`);
            btn.innerHTML = "✖";

            // Click handler to unregister participant
            btn.addEventListener("click", async () => {
              try {
                const resp = await fetch(
                  `/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );

                const result = await resp.json();

                if (resp.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = "message success";
                  messageDiv.classList.remove("hidden");

                  // Refresh activities list to reflect change
                  fetchActivities();
                } else {
                  messageDiv.textContent = result.detail || "Failed to unregister";
                  messageDiv.className = "message error";
                  messageDiv.classList.remove("hidden");
                }

                setTimeout(() => messageDiv.classList.add("hidden"), 4000);
              } catch (err) {
                console.error("Error unregistering:", err);
                messageDiv.textContent = "Failed to unregister. Please try again.";
                messageDiv.className = "message error";
                messageDiv.classList.remove("hidden");
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });

          participantsDiv.appendChild(ul);
        } else {
          const pNode = document.createElement("p");
          pNode.className = "no-participants";
          pNode.textContent = "No participants yet";
          participantsDiv.appendChild(pNode);
        }

        activityCard.appendChild(participantsDiv);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
