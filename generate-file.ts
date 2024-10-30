import fs from "node:fs";
import process from "node:process";

const lazyParseLines = async function* (str: string) {
  let i = 0;
  let j = 0;
  while (j < str.length) {
    if (str[j] === "\n") {
      yield str.slice(i, j);
      i = j + 1;
    }
    j++;
  }
  if (i < j) {
    yield str.slice(i, j);
  }
};

if (process.argv.length < 4) {
  console.error(
    "Usage: node generate-file.js g <file>\nnode generate-file.js t <file>"
  );
  process.exit(1);
}

if (process.argv[2] === "t") {
  if (!fs.existsSync(process.argv[3])) {
    console.error("File does not exist");
    process.exit(1);
  }
  const lines = lazyParseLines(fs.readFileSync(process.argv[3], "utf8"));

  const run = async () => {
    let i = 0;
    for await (const line of lines) {
      if (!line) return;
      if (i % 1000000 === 0) {
        console.error("test", { i });
      }
      if (line !== `test ${i + 1}`) {
        console.error(`Line ${i}: "${line}" vs "test ${i + 1}"`);
        throw new Error(`Line ${i} does not match`);
      }
      i++;
    }
  };

  run()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else if (process.argv[2] !== "g") {
  console.error(
    "Usage: node generate-file.js g <file>\nnode generate-file.js t <file>"
  );
  process.exit(1);
} else {
  if (fs.existsSync(process.argv[3])) {
    console.error("File already exists");
    process.exit(1);
  }

  let s = "";
  for (let i = 0; i < 20000001; i++) {
    if (i % 1000000 === 0) {
      console.error("test", { i });
      fs.appendFileSync(process.argv[3], s);
      s = "";
    }
    s += `test ${i + 1}\n`;
  }
}
