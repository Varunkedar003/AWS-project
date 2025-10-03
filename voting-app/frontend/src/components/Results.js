import React, { useEffect, useState } from "react";
import { getResults } from "../api";

const Results = () => {
  const [votedCount, setVotedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch vote count from backend
  const fetchTotalVotes = async () => {
    try {
      const total = await getResults();
      let parsed = {};

      if (typeof total === "object" && total.votedCount !== undefined) {
        parsed = total;
      } else if (typeof total?.body === "string") {
        try {
          parsed = JSON.parse(total.body);
        } catch (err) {
          console.error("Failed to parse total.body:", err);
        }
      }

      setVotedCount(parsed.votedCount || 0);
    } catch (error) {
      console.error("Error fetching total votes:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  // ⏱ Auto-refresh every 10 seconds
  useEffect(() => {
    fetchTotalVotes(); // Initial fetch
    const interval = setInterval(fetchTotalVotes, 5000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="voting-card">
      <h2 style={{ textAlign: "center" }}>📊 Total Members Voted</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p style={{ fontSize: "24px", fontWeight: "bold", color: "#0078D4" }}>
          {votedCount}
        </p>
      )}
    </div>
  );
};

export default Results;