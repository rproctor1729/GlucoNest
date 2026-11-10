const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('src/utils/chartWindow.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const loaded={exports:{}};
new Function('exports','module',code)(loaded.exports,loaded);
const {getReadingWindow}=loaded.exports;

test('a zoomed 24h brush remains valid when the period shrinks to six readings',()=>{
  const result=getReadingWindow({startIndex:3,endIndex:27},6);
  assert.deepEqual(result,{startIndex:3,endIndex:5});
});
test('both handles stay valid when the start is beyond the new period',()=>{
  assert.deepEqual(getReadingWindow({startIndex:20,endIndex:27},6),{startIndex:5,endIndex:5});
});
test('resetting the brush restores the entire new period',()=>{
  assert.deepEqual(getReadingWindow(null,28),{startIndex:0,endIndex:27});
  assert.deepEqual(getReadingWindow(null,6),{startIndex:0,endIndex:5});
});
test('empty readings and invalid indices never produce NaN coordinates',()=>{
  assert.deepEqual(getReadingWindow(null,0),{startIndex:0,endIndex:0});
  assert.deepEqual(getReadingWindow({startIndex:NaN,endIndex:Infinity},6),{startIndex:0,endIndex:5});
});
