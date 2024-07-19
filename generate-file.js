let s = "";
for (let i = 0; i < 20000000; i++) {
  if (i % 1000000 === 0) {
    console.error("test", { i });
  }
  s += `test ${i + 1}\n`;
}
console.log(s);
