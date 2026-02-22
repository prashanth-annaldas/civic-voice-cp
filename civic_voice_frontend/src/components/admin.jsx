import { useEffect, useState } from "react";
import IssuesMap from "./issueMap";

function Home() {
  const [issues, setIssues] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_BASE}/issues`)
      .then((res) => res.json())
      .then((data) => setIssues(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="adminBG">
      <div className="container mt-4">
        <h4>Reported Problems</h4>
        <IssuesMap issues={issues} />
      </div>
    </div>
  );
}

export default Home;
