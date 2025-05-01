document.addEventListener("DOMContentLoaded", async function () {
    const tutorList = document.getElementById("tutor-list");

    try {
        const response = await fetch("/api/tutors"); // Fetch tutors from the backend
        const tutors = await response.json(); // Convert response to JSON
        if (!Array.isArray(tutors)) {
            throw new Error("Invalid data format received");
        }
        tutors.forEach(tutor => {
            const card = document.createElement("div");
            card.classList.add("col-md-3");

            card.innerHTML = `
                <div class="card">
                    <img src="img.jpeg" alt="Tutor Image" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">${tutor.username}</h5>
                        <p class="card-text">Expert in ${tutor.subject}</p>
                        <p class="card-text"><strong>⭐ ${tutor.ratings} (${tutor.reviews} reviews)</strong></p>
                        <a href="/api/book-slot" class="btn btn-primary">Book Now</a>
                    </div>
                </div>
            `;

            tutorList.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching tutors:", error);
    }
});
