
  async function bookSlot() {
    const selectedSlot = document.getElementById("slotSelect").value;
    
    const response = await fetch("/api/book-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, time: selectedSlot,day:selectedSlot }) // Replace "Divya" dynamically
    });

    const data = await response.json();
    alert(data.message || data.error);
  }
