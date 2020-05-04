const fs = require('fs');
const path = require('path');

const docsVersions = fs.readdirSync(path.join(__dirname, 'docs')).filter((file) => file !== 'index.html' && !file.startsWith('.')).sort().reverse();

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>jackson-js</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <ul>
  ${ docsVersions.map((docsVersion) => `<li><a href="./${docsVersion}/index.html">${docsVersion}</a></li>`).join('\n') }
  </ul>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'docs', 'index.html'), htmlTemplate);
