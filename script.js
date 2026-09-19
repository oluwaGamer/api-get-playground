const endpoint = document.querySelector('#endpoint');
const language = document.querySelector('#language');
const explainCode = document.querySelector('#explain-code');
const runButton = document.querySelector('#run-button');
const requestCode = document.querySelector('#request-code');
const responseData = document.querySelector('#response-data');
const status = document.querySelector('#status');
const copyButton = document.querySelector('#copy-button');
const codeNote = document.querySelector('#code-note');

function codeFor(url) {
  const examples = {
    javascript: `const response = await fetch('${url}');\n\nif (!response.ok) {\n  throw new Error(\`HTTP error: \${response.status}\`);\n}\n\nconst data = await response.json();\nconsole.log(data);`,
    jquery: `$.getJSON('${url}')\n  .done((data) => {\n    console.log(data);\n  })\n  .fail((jqXHR) => {\n    console.error('HTTP error:', jqXHR.status);\n  });`,
    php: `<?php\n$url = '${url}';\n\n$ch = curl_init($url);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$response = curl_exec($ch);\n$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);\ncurl_close($ch);\n\nif ($statusCode !== 200) {\n  throw new Exception("HTTP error: $statusCode");\n}\n\n$data = json_decode($response, true);\nprint_r($data);`,
    java: `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\nvar client = HttpClient.newHttpClient();\nvar request = HttpRequest.newBuilder()\n    .uri(URI.create("${url}"))\n    .GET()\n    .build();\nvar response = client.send(request, HttpResponse.BodyHandlers.ofString());\n\nif (response.statusCode() != 200) {\n  throw new RuntimeException("HTTP error: " + response.statusCode());\n}\nSystem.out.println(response.body());`
  };
  if (!explainCode.checked) return examples[language.value];

  const explanations = {
    javascript: `// 1. Send a GET request to the selected API endpoint.\n// 2. Check whether the server returned a successful response.\n// 3. Convert the JSON response into JavaScript data.\n// 4. Use or display the returned data.\n\n`,
    jquery: `// 1. Send a GET request and ask jQuery to parse JSON.\n// 2. Use the returned data when the request succeeds.\n// 3. Show the HTTP status if the request fails.\n\n`,
    php: `// 1. Store the API URL.\n// 2. Use cURL to make a server-side GET request.\n// 3. Check the HTTP status code.\n// 4. Decode and use the returned JSON data.\n\n`,
    java: `// 1. Create an HTTP client.\n// 2. Build a GET request for the selected endpoint.\n// 3. Send the request and receive the response body.\n// 4. Check the status and use the JSON text.\n\n`
  };
  return explanations[language.value] + examples[language.value];
}

function updateCode() {
  requestCode.textContent = codeFor(endpoint.value);
  const isBrowser = language.value === 'javascript' || language.value === 'jquery';
  codeNote.textContent = isBrowser
    ? `${language.options[language.selectedIndex].text} can run in a web page.`
    : `${language.options[language.selectedIndex].text} must run on a server or local runtime; the button still demos the browser request.`;
}

async function getData() {
  const url = endpoint.value;
  const selectedLanguage = language.options[language.selectedIndex].text;
  const startedAt = performance.now();
  runButton.disabled = true;
  runButton.textContent = 'Fetching…';
  status.className = 'status';
  status.textContent = 'Request in progress…';
  responseData.textContent = '// Waiting for the API response…';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    const data = await response.json();
    const elapsedSeconds = ((performance.now() - startedAt) / 1000).toFixed(2);
    responseData.textContent = `// Selected code language: ${selectedLanguage}\n// Live request retrieved with: JavaScript (browser)\n// Request time: ${elapsedSeconds} seconds\n\n${JSON.stringify(data, null, 2)}`;
    status.className = 'status success';
    status.textContent = `Success — received ${Array.isArray(data) ? `${data.length} items` : 'a response'} in ${elapsedSeconds} seconds (${response.status} OK).`;
  } catch (error) {
    responseData.textContent = `// ${error.message}`;
    status.className = 'status error';
    status.textContent = 'The request failed. Check your connection and try again.';
  } finally {
    runButton.disabled = false;
    runButton.innerHTML = 'Run GET request <span aria-hidden="true">→</span>';
  }
}

endpoint.addEventListener('change', updateCode);
language.addEventListener('change', updateCode);
explainCode.addEventListener('change', updateCode);
runButton.addEventListener('click', getData);
copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(requestCode.textContent);
  copyButton.textContent = 'Copied!';
  setTimeout(() => { copyButton.textContent = 'Copy'; }, 1400);
});
updateCode();
