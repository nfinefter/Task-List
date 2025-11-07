import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const client = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "TasksV2";

// Helper to get userId from JWT
const getUserIdFromEvent = (event) => {
  try {
    const token = event.headers.Authorization?.replace("Bearer ", "");
    if (!token) throw new Error("Missing token");

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.sub) throw new Error("Invalid token");

    return decoded.sub;
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
};

// Fetch tasks for a user
export const fetchTasks = async (userId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId },
  });

  const response = await docClient.send(command);
  return response.Items || [];
};

// Create a new task
export const createTasks = async ({ name, completed, userId }) => {
  const uuid = crypto.randomUUID();

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: { id: uuid, name, completed, userId },
  });

  return await docClient.send(command);
};

// Update a task
export const updateTasks = async ({ id, name, completed, userId }) => {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { userId, id },
    UpdateExpression: "SET #name = :n, completed = :c",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: { ":n": name, ":c": completed },
    ReturnValues: "ALL_NEW",
  });

  return await docClient.send(command);
};

// Delete a task
export const deleteTasks = async ({ id, userId }) => {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { userId, id },
  });

  return await docClient.send(command);
};

// Lambda handler
export const handler = async (event) => {
  const userId = getUserIdFromEvent(event);
  if (!userId) return { statusCode: 401, body: "Unauthorized" };

  try {
    const { httpMethod, body, pathParameters } = event;

    if (httpMethod === "GET") {
      const tasks = await fetchTasks(userId);
      return { statusCode: 200, body: JSON.stringify(tasks) };
    }

    if (httpMethod === "POST") {
      const { name, completed } = JSON.parse(body);
      const task = await createTasks({ name, completed, userId });
      return { statusCode: 201, body: JSON.stringify(task) };
    }

    if (httpMethod === "PUT") {
      const { id, name, completed } = JSON.parse(body);
      const updated = await updateTasks({ id, name, completed, userId });
      return { statusCode: 200, body: JSON.stringify(updated) };
    }

    if (httpMethod === "DELETE") {
      const { id } = pathParameters;
      const deleted = await deleteTasks({ id, userId });
      return { statusCode: 200, body: JSON.stringify(deleted) };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
