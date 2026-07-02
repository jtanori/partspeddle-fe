const routes = ["/", "/search", "/api/search/parts", "/api/health"];

async function smokeTest() {
  const baseUrl = "http://localhost:3000";
  for (const route of routes) {
    try {
      const isPost = route.startsWith("/api/search/parts");
      const method = isPost ? "POST" : "GET";
      const body = isPost ? JSON.stringify({ query: "alternator" }) : undefined;

      const response = await fetch(`${baseUrl}${route}`, {
        method,
        body,
        headers: isPost ? { "Content-Type": "application/json" } : {},
      });
      console.log(`${method} ${route} -> ${response.status}`);
    } catch (e) {
      console.error(`${route} failed: ${e}`);
    }
  }
}

smokeTest();
