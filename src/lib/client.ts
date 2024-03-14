import { Client } from 'discord.js';

let client: Client;

export function setClient(clientToSet: Client) {
  client = clientToSet;
}

export function getClient() {
  return client;
}