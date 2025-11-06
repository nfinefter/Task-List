import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import { fetchTasks, createTasks, updateTasks, deleteTasks } from "./task.js";
import { verifyToken } from "./authMiddleware.js"; 

const app = express();
const port = 3001;

app.use(express.json());

if (process.env.DEVELOPMENT) {
  app.use(cors());
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/task", verifyToken);

app.get("/task", async (req, res) => {
  try {
    const tasks = await fetchTasks(req.user.sub);
    res.send(tasks.Items);
  } catch (err) {
    res.status(400).send(`Error fetching tasks: ${err}`);
  }
});

// POST /task
app.post("/task", async (req, res) => {
  try {
    const task = { ...req.body, userId: req.user.sub }; 
    res.send(response);
  } catch (err) {
    res.status(400).send(`Error creating tasks: ${err}`);
  }
});

// PUT /task
app.put("/task", async (req, res) => {
  try {
    const task = { ...req.body, userId: req.user.sub };
    const response = await updateTasks(task);
    res.send(response);
  } catch (err) {
    res.status(400).send(`Error updating tasks: ${err}`);
  }
});

// DELETE /task/:id
app.delete("/task/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await deleteTasks(id, req.user.sub);
    res.send(response);
  } catch (err) {
    res.status(400).send(`Error deleting tasks: ${err}`);
  }
});

if (process.env.DEVELOPMENT) {
  app.listen(port, () => console.log(`App listening on port ${port}`));
}

app.all("*", (req, res) => res.status(404).send("Route not found!"));

export const handler = serverless(app);
