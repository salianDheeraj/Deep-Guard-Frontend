import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 300 seconds (5 minutes) for Next.js

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"
).replace(/\/$/, "");

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];

  const subPath = pathSegments.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/api/${subPath}${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Avoid forwarding the host header to prevent host mismatches on the backend
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 300000); // 300 seconds

  try {
    let body: BodyInit | undefined;
    if (!["GET", "HEAD"].includes(req.method)) {
      body = await req.arrayBuffer();
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      signal: abortController.signal,
      redirect: "manual",
    });

    clearTimeout(timeoutId);

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          message: "Gateway timeout: Request to backend exceeded 300 seconds.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `Proxy error connecting to backend: ${error.message}`,
      },
      { status: 502 }
    );
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as PATCH,
  handleProxy as DELETE,
  handleProxy as OPTIONS,
};

