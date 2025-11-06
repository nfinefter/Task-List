import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  UpdateCommand,
  PutCommand,
  DynamoDBDocumentClient,
  ScanCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { Auth } from "@aws-amplify";
import {currentAuthenticatedUser} from "@aws-amplify/auth"; 


import crypto from "crypto";

const client = new DynamoDBClient({ region: "us-east-2" });
const docClient = DynamoDBDocumentClient.from(client);



export const fetchTasks = async () => {
  const user = await currentAuthenticatedUser();
  const userId = user.attributes.sub;

  const command = new QueryCommand({
    TableName: "Tasks",
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: {
      ":uid": userId,
    },
  });

  const response = await docClient.send(command);
  return response.Items;
};

export const createTasks = async ({ name, completed }) => {
  const user = await currentAuthenticatedUser();
  const userId = user.attributes.sub; 
  const uuid = crypto.randomUUID();

  const command = new PutCommand({
    TableName: "Tasks",
    Item: {
      id: uuid,
      userId,       
      name,
      completed,
    },
  });

  return await docClient.send(command);
};

export const updateTasks = async ({ id, name, completed }) => {
  const user = await currentAuthenticatedUser();
  const userId = user.attributes.sub;

  const command = new UpdateCommand({
    TableName: "Tasks",
    Key: { userId, id },
    ExpressionAttributeNames: { "#name": "name" },
    UpdateExpression: "set #name = :n, completed = :c",
    ExpressionAttributeValues: { ":n": name, ":c": completed },
    ReturnValues: "ALL_NEW",
  });

  return await docClient.send(command);
};

export const deleteTasks = async (id) => {
  const user = await currentAuthenticatedUser();
  const userId = user.attributes.sub;

  const command = new DeleteCommand({
    TableName: "Tasks",
    Key: { userId, id },
  });

  return await docClient.send(command);
};

