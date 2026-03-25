import * as fs from 'fs';
const text = fs.readFileSync('error.log', 'utf16le');
console.log(text.substring(0, 1500));
