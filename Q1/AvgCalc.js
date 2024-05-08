const express = require("express");
const axios = require("axios");
const { AbortController } = require("node-abort-controller");

const app = express();
const port = 9876;
const windowSize = 10;
const numberStore = new Set();

const numberTypeMapping = {
  p: "primes",
  f: "fibo",
  r: "rand",
  e: "even",
};

const authorizationToken =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE1MTUwOTI5LCJpYXQiOjE3MTUxNTA2MjksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVhNzYxNzBhLTBlMTktNGE0Ny1hZTljLWQ2NDZkODVmNzI3NSIsInN1YiI6IjIxMDUyMTQwQGtpaXQuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjVhNzYxNzBhLTBlMTktNGE0Ny1hZTljLWQ2NDZkODVmNzI3NSIsImNsaWVudFNlY3JldCI6IldHSEVxcEVRVUlDZHpxbnMiLCJvd25lck5hbWUiOiJBbmlzaGEgUmFqIiwib3duZXJFbWFpbCI6IjIxMDUyMTQwQGtpaXQuYWMuaW4iLCJyb2xsTm8iOiIyMTA1MjE0MCJ9.DgzbNLvMWMqoylMy09WyVrVOhaXvCSH1dZqvlsFNrS4",

app.get("/numbers/:numberId", async (req, res) => {
  const numberId = req.params.numberId;

  if (!numberTypeMapping[numberId]) {
    return res.status(400).send("Invalid number type");
  }

  const testServerUrl = `http://20.244.56.144/test/${numberTypeMapping[numberId]}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await axios.get(testServerUrl, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${authorizationToken}`,
      },
    });
    clearTimeout(timeoutId);

    const newNumbers = response.data.numbers.filter(
      (num) => !numberStore.has(num)
    );
    numberStore.add(...newNumbers);

    if (numberStore.size > windowSize) {
      const iterator = numberStore.keys();
      numberStore.delete(iterator.next().value);
    }

    let avg = null;
    if (numberStore.size === windowSize) {
      avg = [...numberStore].reduce((sum, num) => sum + num, 0) / windowSize;
    }

    const windowPrevState = [...numberStore];

    res.json({
      windowPrevState,
      windowCurrState: windowPrevState,
      numbers: response.data.numbers,
      avg,
    });
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error("Request timed out");
      res.status(500).send("Request timed out");
    } else {
      console.error(error);
      res.status(500).send("Error fetching data");
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
