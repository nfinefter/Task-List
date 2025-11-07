// task.js
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "TasksV2"; // same table you already have

// ✅ Fetch tasks for a user
export const fetchTasks = async (userId) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId },
  });

  const response = await docClient.send(command);
  return response.Items || [];
};

// ✅ Create a new task
export const createTasks = async ({ name, completed = false, userId }) => {
  const id = crypto.randomUUID();
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: { id, name, completed, userId },
  });

  await docClient.send(command);
  return { id, name, completed, userId };
};

// ✅ Update a task
export const updateTasks = async ({ id, name, completed, userId }) => {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { userId, id },
    UpdateExpression: "SET #name = :n, completed = :c",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: { ":n": name, ":c": completed },
    ReturnValues: "ALL_NEW",
  });

  const result = await docClient.send(command);
  return result.Attributes;
};

// ✅ Delete a task
export const deleteTasks = async (id, userId) => {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { userId, id },
  });

  await docClient.send(command);
  return { success: true };
};
