// customFormatter.js
export default function (results) {
  let output = '';
  results.forEach((result) => {
    result.messages.forEach((message) => {
      output += `${result.filePath} ${message.line}:${message.column} ${message.message}\n`;
    });
  });
  return output;
}   
