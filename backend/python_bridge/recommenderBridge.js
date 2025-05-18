const User = require("../models/userModel");
const Event = require("../models/eventModel");
const { spawn } = require("child_process");

const runRecommenderPythonScript = (profile, events, history = [], friends = [], mode = "events") => {
  return new Promise((resolve, reject) => {
    const py = spawn("python", ["recommendation/main.py"]);
    const inputPayload = JSON.stringify({ profile, events, history, friends, mode });

    let output = "";
    py.stdout.on("data", (data) => (output += data));
    py.stderr.on("data", (err) => console.error("Python error:", err.toString()));
    py.on("close", () => {
      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (e) {
        reject("Failed to parse recommender response: " + e.message);
      }
    });

    py.stdin.write(inputPayload);
    py.stdin.end();
  });
};

module.exports = { runRecommenderPythonScript };
