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

  const explainedExamples = {
    javascript: `// Send a GET request to the selected API endpoint.\nconst response = await fetch('${url}');\n\n// Stop and report an error when the server does not return success.\nif (!response.ok) {\n  throw new Error(\`HTTP error: \${response.status}\`);\n}\n\n// Convert the JSON response into usable JavaScript data.\nconst data = await response.json();\n\n// Use the returned data (the page displays it instead of only logging it).\nconsole.log(data);`,
    jquery: `// Send a GET request and automatically parse its JSON response.\n$.getJSON('${url}')\n  // This callback runs when the request succeeds.\n  .done((data) => {\n    // Use the JSON data returned by the API.\n    console.log(data);\n  })\n  // This callback runs when the request fails.\n  .fail((jqXHR) => {\n    // Read the HTTP status code to help diagnose the error.\n    console.error('HTTP error:', jqXHR.status);\n  });`,
    php: `<?php\n// Store the URL of the API endpoint to request.\n$url = '${url}';\n\n// Create a cURL request for that URL.\n$ch = curl_init($url);\n// Tell cURL to return the response rather than print it immediately.\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n// Run the GET request and save the response text.\n$response = curl_exec($ch);\n// Read the HTTP status code returned by the server.\n$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);\n// Close the cURL connection because the request is complete.\ncurl_close($ch);\n\n// Stop if the API did not send a successful response.\nif ($statusCode !== 200) {\n  throw new Exception("HTTP error: $statusCode");\n}\n\n// Convert the JSON response into a PHP array.\n$data = json_decode($response, true);\n// Display the returned data.\nprint_r($data);`,
    java: `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\n// Create an HTTP client that can make web requests.\nvar client = HttpClient.newHttpClient();\n// Build a request for the selected API URL.\nvar request = HttpRequest.newBuilder()\n    .uri(URI.create("${url}"))\n    // Set the request method to GET.\n    .GET()\n    .build();\n// Send the request and keep the response body as text.\nvar response = client.send(request, HttpResponse.BodyHandlers.ofString());\n\n// Stop if the API did not return a successful response.\nif (response.statusCode() != 200) {\n  throw new RuntimeException("HTTP error: " + response.statusCode());\n}\n// Display the JSON text returned by the API.\nSystem.out.println(response.body());`
  };
  return explainedExamples[language.value];
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
