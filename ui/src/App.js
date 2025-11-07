import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AddTaskForm } from "./components/AddTaskForm";
import { Task } from "./components/Task";
import axios from "axios";
import { API_URL } from "./utils";

import { Amplify} from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

const darkTheme = createTheme({
  palette: { mode: "dark" },
});

const getIdToken = async () => {
  try {
    const session = await Amplify.currentSession(); 
    const idToken = session.getIdToken().getJwtToken();
    return idToken;
  } catch (err) {
    console.error("Error getting ID token:", err);
    return null;
  }
};

const COGNITO_DOMAIN = "us-east-2tkqvhkitl.auth.us-east-2.amazoncognito.com";
const CLIENT_ID = '63uh95r2deoaclc4jnjp7h76k9';
const REDIRECT_URI = "https://main.dnrxo3yjvzip5.amplifyapp.com/";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchTasks = async () => {
  try {
    const token = await getIdToken();
    const { data } = await axios.get(API_URL + "/task", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setTasks(data);
  } catch (err) {
    console.error("Error fetching tasks:", err);
  }
};



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setIsAuthenticated(true);
      fetchTasks();
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const signIn = () => {
    const url = `https://${COGNITO_DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=openid+email&redirect_uri=${REDIRECT_URI}`;
    window.location.href = url;
  };

  const signOut = () => {
    const url = REDIRECT_URI;
    window.location.href = url;
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>Please sign in</h2>
          <button onClick={signIn}>Sign in with Cognito</button>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{ textAlign: "right", padding: "1rem" }}>
        <button onClick={signOut}>Sign Out</button>
      </div>
      <AddTaskForm fetchTasks={fetchTasks} />
      {tasks.map((task) => (
        <Task task={task} key={task.id} fetchTasks={fetchTasks} />
      ))}
    </ThemeProvider>
  );
}
