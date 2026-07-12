// platform/scripts/tooling/eslint-formatter.js
// Usage: npx eslint "src/**/*.{ts,tsx}" --cache --quiet --format ./platform/scripts/tooling/eslint-formatter.js
export default function (results) {
  let output = '';
  results.forEach((result) => {
    result.messages.forEach((message) => {
      output += `${result.filePath} ${message.line}:${message.column} ${message.message}\n`;
    });
  });
  return output;
}   
