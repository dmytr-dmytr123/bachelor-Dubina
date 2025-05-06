const { spawn } = require("child_process");
const path = require("path");

function runRecommenderPythonScript(userProfile, events, type = "events", userHistory = []) {
  return new Promise((resolve, reject) => {
    const pyPath = path.join(__dirname, "..", "recommendation", "recommender.py");
    const pythonPath = path.join(__dirname, "..", "..", ".venv", "bin", "python");

    const process = spawn(pythonPath, [pyPath]);

    const input = JSON.stringify({
      user_profile: userProfile,
      events,
      user_history: userHistory,
      type
    });

    let output = "";

    process.stdout.on("data", (data) => {
      const text = data.toString();
      console.log("python returned:", text);
      output += text;
    });

    process.on("close", (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(output);
          resolve(parsed);
        } catch (err) {
          reject("Failed to parse JSON: " + err.message);
        }
      } else {
        reject("Python script exited with code " + code);
      }
    });

    process.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    process.stdin.write(input);
    process.stdin.end();
  });
}

module.exports = {
  runRecommenderPythonScript,
};
