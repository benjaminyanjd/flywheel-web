import crypto from "crypto";

function getConfig() {
  return {
    BASE_URL: process.env.INFINI_BASE_URL || "https://openapi.infini.money",
    KEY_ID: process.env.INFINI_KEY_ID || "",
    SECRET_KEY: process.env.INFINI_SECRET_KEY || "",
  };
}

function getGMTDate(): string {
  return new Date().toUTCString();
}

function buildSignature(method: string, path: string, date: string): string {
  const { KEY_ID, SECRET_KEY } = getConfig();
  const signingString = `${KEY_ID}\n${method} ${path}\ndate: ${date}\n`;
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(signingString);
  return hmac.digest("base64");
}

function buildDigest(body: string): string {
  const hash = crypto.createHash("sha256").update(body).digest("base64");
  return `SHA-256=${hash}`;
}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { BASE_URL, KEY_ID } = getConfig();
  const date = getGMTDate();
  const signature = buildSignature(method, path, date);
  const authHeader = `Signature keyId="${KEY_ID}",algorithm="hmac-sha256",headers="@request-target date",signature="${signature}"`;

  const headers: Record<string, string> = {
    Date: date,
    Authorization: authHeader,
  };

  let bodyStr: string | undefined;
  if (body !== undefined) {
    bodyStr = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
    headers["Digest"] = buildDigest(bodyStr);
  }

  const url = `${BASE_URL}${path}`;
  console.log('[infini] url:', url, 'keyId:', KEY_ID, 'auth:', authHeader.substring(0, 80));
  const res = await fetch(url, {
    method,
    headers,
    body: bodyStr,
  });

  if (!res.ok) {
    const text = await res.text();
    console.log('[infini] 401 headers sent:', JSON.stringify(headers));
    throw new Error(`Infini API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export interface CreateOrderParams {
  request_id: string;
  amount: string;
  currency?: string;
  client_reference: string;
  success_url: string;
  failure_url: string;
  description?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  checkout_url: string;
  [key: string]: unknown;
}

export interface GetOrderResponse {
  order_id: string;
  status: string;
  amount: string;
  currency: string;
  client_reference: string;
  [key: string]: unknown;
}

export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
  const data = await request<{ data?: CreateOrderResponse } & CreateOrderResponse>(
    "POST",
    "/v1/acquiring/order",
    params as unknown as Record<string, unknown>
  );
  // Handle both wrapped and unwrapped responses
  if (data.data) return data.data;
  return data as unknown as CreateOrderResponse;
}

export async function getOrder(orderId: string): Promise<GetOrderResponse> {
  const data = await request<{ data?: GetOrderResponse } & GetOrderResponse>(
    "GET",
    `/v1/acquiring/order?order_id=${orderId}`
  );
  if (data.data) return data.data;
  return data as unknown as GetOrderResponse;
}
