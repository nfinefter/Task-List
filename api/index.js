import express from "express";
import { fetchTasks, createTasks, updateTasks, deleteTasks } from"./task.js";
import serverless from "serverless-http";
import cors from "cors";
const app = express();
const port = 3001;

app.use(express.json());

if (process.env.DEVELOPMENT){
    app.use(cors());
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/task.js", async (req, res) => {
  try {
    const tasks = await fetchTasks();

    res.send(tasks.Items);
  } catch (err) {
    res.status(400).send({ error: `Could not fetch tasks: ${err}` });
  }
});

app.post("/task.js", async (req, res) => {
  try {
    const tasks = req.body;

    const response = await createTasks(tasks);

    res.send(response);
  } catch (err) {
    res.status(400).send({ error: `Could not create tasks: ${err}` });
  }
});

app.put("/task.js", async (req, res) => {
   try {
    const tasks = req.body;

    const response = await updateTasks(tasks);

    res.send(response);
  } catch (err) {
    res.status(400).send({ error: `Could not update tasks: ${err}` });
  }
});

app.delete("/task.js/:id", async (req, res) => {
  try {
    const {id} = req.params;

    const response = await deleteTasks(id);

    res.send(response);
  } catch (err) {
    res.status(400).send({ error: `Could not delete tasks: ${err}` });
  }
});

if (process.env.DEVELOPMENT) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

export const handler = serverless(app);