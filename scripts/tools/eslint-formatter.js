// scripts/tools/eslint-formatter.js
// Usage: npx eslint "src/**/*.{ts,tsx}" --cache --quiet --format ./scripts/tools/eslint-formatter.js
export default function (results) {
  let output = '';
  results.forEach((result) => {
    result.messages.forEach((message) => {
      output += `${result.filePath} ${message.line}:${message.column} ${message.message}\n`;
    });
  });
  return output;
}   
