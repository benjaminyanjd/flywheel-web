/**
 * Read an SSE stream that sends `data: {"text":"..."}` chunks,
 * accumulate text, and call `onChunk` with the running total after each update.
 * Returns the final accumulated text.
 */
export async function readSSEStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (accumulated: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const json = JSON.parse(line.slice(6));
        if (json.text) accumulated += json.text;
      } catch {}
    }
    onChunk(accumulated);
  }

  return accumulated;
}
