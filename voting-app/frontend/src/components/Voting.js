import React, { useState } from "react";

const Voting = ({ location }) => {
  const [userId, setUserId] = useState("");
  const [candidate, setCandidate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { country, state, city, center } = location;

  const handleVote = async () => {
    if (submitting) return;
    setSubmitting(true);

    const isValidUserId = /^[a-zA-Z0-9]{6}$/.test(userId);
    if (!isValidUserId) {
      setMessage("⚠️ User ID must be 6 alphanumeric characters");
      setSubmitting(false);
      return;
    }

    if (!candidate || !country || !state || !city || !center) {
      setMessage("⚠️ Please complete all fields");
      setSubmitting(false);
      return;
    }

    const payload = {
      userId,
      candidate,
      country,
      state,
      city,
      center
    };

    try {
      const response = await fetch(
        "https://043myauka5.execute-api.ap-south-1.amazonaws.com/prod/vote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.status === 200 && data.message === "Vote submitted successfully") {
        setMessage("✅ Vote submitted successfully");
        setUserId("");
        setCandidate("");
      } else if (response.status === 400 && data.error === "You have already cast your vote") {
        setMessage("⚠️ You have already voted with this Member ID");
      } else {
        setMessage("❌ Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Vote error:", error?.message || error);
      setMessage("❌ Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="voting-card">
      <h2 style={{ textAlign: "center" }}>🗳️ Cast Your Vote</h2>

      <label><span role="img" aria-label="user">🧑‍💼</span> Member ID:</label>
      <input
        type="text"
        placeholder="Enter your 6-digit alphanumeric User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      /><br /><br />

      <label><span role="img" aria-label="candidate">🗳️</span> Select Candidate:</label>
      <select className="styled-select" value={candidate} onChange={(e) => setCandidate(e.target.value)}>
        <option value="">Select Candidate</option>
        <option value="alice">Alice</option>
        <option value="bob">Bob</option>
        <option value="charlie">Charlie</option>
        <option value="diana">Diana</option>
      </select><br /><br />

      <p>
        <strong>📍 Location:</strong><br />
        Country: {country || "—"}<br />
        State: {state || "—"}<br />
        City: {city || "—"}<br />
        Center: {center || "—"}
      </p>

      <button onClick={handleVote} disabled={submitting}>Vote</button>

      {message && (
        <p className={`message ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Voting;