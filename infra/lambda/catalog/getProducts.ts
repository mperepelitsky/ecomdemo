import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const SORTERS: Record<
  string,
  (left: Record<string, unknown>, right: Record<string, unknown>) => number
> = {
  price_asc: (left, right) => compareNumber(left.price, right.price),
  price_desc: (left, right) => compareNumber(right.price, left.price),
  name_asc: (left, right) => compareString(left.name, right.name),
  name_desc: (left, right) => compareString(right.name, left.name),
};

function compareNumber(left: unknown, right: unknown) {
  const leftValue = toNumber(left);
  const rightValue = toNumber(right);

  if (leftValue === null && rightValue === null) {
    return 0;
  }
  if (leftValue === null) {
    return 1;
  }
  if (rightValue === null) {
    return -1;
  }
  return leftValue - rightValue;
}

function compareString(left: unknown, right: unknown) {
  const leftValue = String(left ?? "").toLowerCase();
  const rightValue = String(right ?? "").toLowerCase();
  return leftValue.localeCompare(rightValue);
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseCsvParam(value: unknown) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function readQueryParam(
  params: Record<string, string> | undefined,
  key: string,
) {
  return params?.[key];
}

function listIncludes(haystack: string[], needle: string) {
  const normalizedNeedle = needle.toLowerCase();
  return haystack.some((entry) => entry.toLowerCase() === normalizedNeedle);
}

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }
  return [];
}

function matchesList(value: unknown, expected: string[]) {
  if (expected.length === 0) {
    return true;
  }

  const values = normalizeArray(value);
  if (values.length === 0) {
    return false;
  }

  return expected.some((entry) => listIncludes(values, entry));
}

function matchesScalar(value: unknown, expected: string[]) {
  if (expected.length === 0) {
    return true;
  }
  const normalized = String(value ?? "").toLowerCase();
  return expected.some((entry) => entry.toLowerCase() === normalized);
}

function matchesQuery(item: Record<string, unknown>, query: string[]) {
  if (query.length === 0) {
    return true;
  }

  const name = String(item.name ?? "").toLowerCase();
  const description = String(item.description ?? "").toLowerCase();
  return query.some((entry) => {
    const term = entry.toLowerCase();
    return name.includes(term) || description.includes(term);
  });
}

export async function handler(event: any) {
  const tableName = process.env.PRODUCTS_TABLE;
  if (!tableName) {
    throw new Error("PRODUCTS_TABLE is not set");
  }

  const requestId = event?.requestContext?.requestId ?? "unknown";
  const rawPath = event?.rawPath ?? "";
  const productId = event?.pathParameters?.productId;
  const isProductDetail =
    typeof productId === "string" &&
    productId.length > 0 &&
    rawPath.startsWith("/products/");

  if (isProductDetail) {
    const result = await dynamo.send(
      new GetCommand({
        TableName: tableName,
        Key: { productId },
      }),
    );

    const item = result.Item as Record<string, unknown> | undefined;
    const total = item ? 1 : 0;
    console.log(`requestId=${requestId} total=${total}`);

    if (!item) {
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: item }),
    };
  }

  const queryParams = event?.queryStringParameters as
    | Record<string, string>
    | undefined;

  const categoryIds = parseCsvParam(readQueryParam(queryParams, "categoryId"));
  const searchTerms = parseCsvParam(readQueryParam(queryParams, "q"));
  const tags = parseCsvParam(readQueryParam(queryParams, "tags"));
  const promoFlags = parseCsvParam(readQueryParam(queryParams, "promoFlags"));
  const priceBands = parseCsvParam(readQueryParam(queryParams, "priceBand"));
  const inventoryStatuses = parseCsvParam(
    readQueryParam(queryParams, "inventoryStatus"),
  );
  const colors = parseCsvParam(readQueryParam(queryParams, "color"));
  const sizes = parseCsvParam(readQueryParam(queryParams, "size"));
  const sortKey = String(readQueryParam(queryParams, "sort") ?? "").toLowerCase();

  const products: Record<string, unknown>[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined;

  do {
    const result = await dynamo.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    if (result.Items) {
      products.push(...(result.Items as Record<string, unknown>[]));
    }

    lastEvaluatedKey = result.LastEvaluatedKey as
      | Record<string, unknown>
      | undefined;
  } while (lastEvaluatedKey);

  const filtered = products.filter((item) =>
    matchesScalar(item.categoryId, categoryIds) &&
    matchesQuery(item, searchTerms) &&
    matchesList(item.tags, tags) &&
    matchesList(item.promoFlags, promoFlags) &&
    matchesScalar(item.priceBand, priceBands) &&
    matchesScalar(item.inventoryStatus, inventoryStatuses) &&
    matchesList(item.color, colors) &&
    matchesList(item.size, sizes),
  );

  const sorter = SORTERS[sortKey];
  if (sorter) {
    filtered.sort(sorter);
  }

  console.log(`requestId=${requestId} total=${filtered.length}`);

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ data: filtered, meta: { total: filtered.length } }),
  };
}
