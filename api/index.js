import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { fetchTasks, createTasks, updateTasks, deleteTasks } from "./task.js";
import authMiddleware from "./auth.middleware.js";

const app = express();
const port = 3001;

app.use(express.json());

const corsOptions = {
  origin: "https://main.dnrxo3yjvzip5.amplifyapp.com", // your frontend
  credentials: true, // if sending cookies or Authorization header
};

app.use(cors(corsOptions)); // only here, do NOT add another header manually
//app.options("*", cors(corsOptions));

// ✅ Attach authentication middleware
app.use(authMiddleware);

// Root route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ GET /task — Fetch tasks for this Cognito user
app.get("/task", async (req, res) => {
  try {
    const tasks = await fetchTasks(req.user.sub);
    res.send(tasks.Items);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(400).send(`Error fetching tasks: ${err}`);
  }
});

// ✅ POST /task — Create a new task for this user
app.post("/task", async (req, res) => {
  try {
    const task = { ...req.body, userId: req.user.sub };
    const response = await createTasks(task);
    res.status(201).send(response);
  } catch (err) {
    alert("THIS IS AN ALERT")
    console.error("Error creating task:", err);
    res.status(400).send(`Error creating task: ${err}`);
  }
});

// ✅ PUT /task — Update an existing task
app.put("/task", async (req, res) => {
  try {
    const task = { ...req.body, userId: req.user.sub };
    const response = await updateTasks(task);
    res.send(response);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).send(`Error updating task: ${err}`);
  }
});

// ✅ DELETE /task/:id — Delete a task for this user
app.delete("/task/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteTasks(id, req.user.sub);
    res.send(response);
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(400).send(`Error deleting task: ${err}`);
  }
});

if (process.env.DEVELOPMENT) {
  app.listen(port, () => console.log(`App listening on port ${port}`));
}

app.use((req, res, next) => {
  res.status(404).send("Route not found!");
});


export const handler = serverless(app);
