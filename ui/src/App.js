import React, { useState, useEffect } from "react";
import axios from "axios";

const COGNITO_DOMAIN = "tkqvhkitl.auth.us-east-2.amazoncognito.com"; // exact hosted UI domain
const CLIENT_ID = "63uh95r2deoaclc4jnjp7h76k9"; // client without secret
const REDIRECT_URI = "https://main.dnrxo3yjvzip5.amplifyapp.com/";
const API_URL = "https://your-lambda-url/task"; // replace with your lambda URL

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [idToken, setIdToken] = useState(null);

  const fetchTasks = async (token) => {
    try {
      const { data } = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch tasks: " + err.message);
    }
  };

  useEffect(() => {
    // Parse id_token from URL hash after login
    const hash = new URLSearchParams(window.location.hash.replace("#", "?"));
    const token = hash.get("id_token");
    if (token) {
      setIdToken(token);
      fetchTasks(token);
      window.history.replaceState({}, document.title, "/"); // clean URL
    }
  }, []);

  const signIn = () => {
    window.location.href = `https://${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=token&scope=openid+email&redirect_uri=${REDIRECT_URI}`;
  };

  const signOut = () => {
    setIdToken(null);
    setTasks([]);
    window.location.href = REDIRECT_URI;
  };

  if (!idToken) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Please sign in</h2>
        <button onClick={signIn}>Sign in with Cognito</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={signOut}>Sign Out</button>
      <h2>Your Tasks</h2>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.name}</li>
        ))}
      </ul>
    </div>
  );
}
