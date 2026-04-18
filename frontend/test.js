const fs = require('fs');
const txt = fs.readFileSync('C:/Users/hamro/AppData/Roaming/Code/User/workspaceStorage/e76d0a720dc97b1d2fb2bf610cae2ac7/GitHub.copilot-chat/chat-session-resources/1d292cf6-99ef-48f3-9d39-13139e802b3d/call_MHxLR01FOHZMMXM3ZWUxVW1oNWs__vscode-1776247115491/content.txt', 'utf8');
const jstr = txt.trim().replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"');
console.log(jstr.substring(0,20));
try {
const parsed = JSON.parse(jstr);
fs.writeFileSync('public/renault-clio.jpg', Buffer.from(parsed.clio, 'base64'));
fs.writeFileSync('public/renault-megane.jpg', Buffer.from(parsed.megane, 'base64'));
console.log('Success');
} catch(e) { console.error('Fail:', e.message); }
