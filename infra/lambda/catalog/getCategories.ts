import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function handler(event: any) {
  const tableName = process.env.CATEGORIES_TABLE;
  if (!tableName) {
    throw new Error("CATEGORIES_TABLE is not set");
  }

  const categories: Record<string, unknown>[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await dynamo.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    if (result.Items) {
      categories.push(...(result.Items as Record<string, unknown>[]));
    }

    lastEvaluatedKey = result.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined;
  } while (lastEvaluatedKey);

  const categoriesSorted = categories.sort((left, right) => {
    const leftOrder = parseNumber(left.sortOrder);
    const rightOrder = parseNumber(right.sortOrder);

    if (leftOrder !== null && rightOrder !== null && leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    if (leftOrder !== null && rightOrder === null) {
      return -1;
    }

    if (leftOrder === null && rightOrder !== null) {
      return 1;
    }

    const leftName = String(left.name ?? "").toLowerCase();
    const rightName = String(right.name ?? "").toLowerCase();
    return leftName.localeCompare(rightName);
  });

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      data: categoriesSorted,
      meta: { total: categoriesSorted.length },
    }),
  };
}
