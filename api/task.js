import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  PutCommand,
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(client);

export const fetchTasks = async () => {
  const command = new ScanCommand({
    ExpressionAttributeNames: { "#name": "name" },
    ProjectionExpression: "id, #name, completed",
    TableName: "TasksV2",
    ExpressionAttributeValues: {
      ":uid": userId,
    },
  });

  const response = await docClient.send(command);

  return response;
};

export const createTasks = async ({ name, completed }) => {
  const uuid = crypto.randomUUID();
  const command = new PutCommand({
    TableName: "TasksV2",
    Item: {
      id: uuid,
      name,
      completed,
      userId
    },
  });

  const response = await docClient.send(command);

  return response;
};

export const updateTasks = async ({ id, name, completed }) => {
  const command = new UpdateCommand({
    TableName: "TasksV2",
    Key: {
      userId, id,
    },
    ExpressionAttributeNames: {
      "#name": "name",
    },
    UpdateExpression: "set #name = :n, completed = :c",
    ExpressionAttributeValues: {
      ":n": name,
      ":c": completed,
    },
    ReturnValues: "ALL_NEW",
  });

  const response = await docClient.send(command);

  return response;
};

export const deleteTasks = async (id) => {
  const command = new DeleteCommand({
    TableName: "TasksV2",
    Key: {
      userId, id,
    },
  });

  const response = await docClient.send(command);

  return response;
};