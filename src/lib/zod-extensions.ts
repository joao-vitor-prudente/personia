import { type Id, type TableNames } from "@server/dataModel";
import { z } from "zod";

export function id<TableName extends TableNames>(_tableName?: TableName) {
  return z.string() as unknown as z.Schema<Id<TableName>>;
}

export const z2 = {
  id,
};