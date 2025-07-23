const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const dbConnection = require("./mongodb");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For parsing JSON data
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Get started
// app.get("/", (req, res) => {
//   res.sendFile(__dirname, "views", "index.html");
// });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
});

// Register page
app.get("/register", (req, res) => {
  res.render("register");
});

// Handle user registration
app.post("/approach", async (req, res) => {
  const { username, password } = req.body;
  let data = await dbConnection();
  await data.insertOne({ username, password });
  res.render("approach"); // Redirect to Dashboard after registration
});

// Handle authentication
app.post("/account", async (req, res) => {
  const { username, password } = req.body;
  let data = await dbConnection();
  let user = await data.findOne({ username, password });
  if (user) {
    res.redirect("/dashboard"); // Redirect to dashboard if authenticated
  } else {
    res.render("error"); // Redirect to error page if authentication fails
  }
});

app.get("/dashboard", (req, res) => {
  res.render("approach");
});

// Simple Manner - Search with JSON
app.get("/simple", (req, res) => {
  res.render("simple");
});

// Professional Manner - Web Scraping
app.get("/professional", (req, res) => {
  res.render("professional");
});

// Search using Simple Manner (JSON)
app.post("/search-json", (req, res) => {
  const query = req.body.query.toLowerCase().trim();
  const jsonFilePath = path.join(__dirname, "data", "laws.json");
  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return res.status(500).send("Internal Server Error");
    }
    const laws = JSON.parse(data);
    const results = laws.filter((law) => law.keyword.includes(query));
    if (results.length === 0) {
      results.push({
        title: "No results found",
        description: "Please try a different search term.",
      });
    }
    res.render("results", { query, results });
  });
});

// Route to show more details for each law
app.get("/law/:keyword", (req, res) => {
  const keyword = req.params.keyword.toLowerCase();
  const jsonFilePath = path.join(__dirname, "data", "laws.json");

  fs.readFile(jsonFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return res.status(500).send("Internal Server Error");
    }

    const laws = JSON.parse(data);
    const law = laws.find((l) => l.keyword.toLowerCase() === keyword);

    if (law) {
      // Add more detailed professional words and information
      law.details = `The ${law.title} is a comprehensive piece of legislation that outlines specific rules and regulations regarding "${law.keyword}". For instance, any violation may attract a fine ranging from INR 1,000 to INR 10,000 depending on the severity of the offense. This law ensures the protection of individual rights, and any infringement can lead to financial penalties, and in some cases, legal proceedings. If you require further assistance or financial help in relation to this law, there are government bodies that can guide you.`;
      res.render("lawDetails", { law });
    } else {
      res.status(404).render("error", { message: "Law not found" });
    }
  });
});

// Search using Professional Manner (Web Scraping)
app.post("/search-scrape", async (req, res) => {
  const query = req.body.query;
  const url = `https://www.indiankanoon.org/search/?formInput=${encodeURIComponent(
    query
  )}`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];
    $(".result_title").each((i, element) => {
      const title = $(element).text().trim();
      const link = `https://www.indiankanoon.org${$(element)
        .find("a")
        .attr("href")}`;
      results.push({ title, link });
    });
    res.render("results", { query, results });
  } catch (error) {
    console.error("Error scraping data:", error);
    res.render("results", { query, results: [] });
  }
});

// Serve the chat page
app.get("/chat", (req, res) => {
  res.render("chat");
});

// Chatbot endpoint using chatbot_responses.json and laws.json data
app.post("/chatbot", async (req, res) => {
  const userInput = req.body.message.toLowerCase().trim();
  const responseFilePath = path.join(
    __dirname,
    "data",
    "chatbot_responses.json"
  );
  const lawFilePath = path.join(__dirname, "data", "laws.json");

  // First check chatbot_responses.json for predefined questions
  fs.readFile(responseFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading chatbot responses JSON file:", err);
      return res.status(500).send("Internal Server Error");
    }

    const responses = JSON.parse(data);
    let response = null;

    // Searching through predefined responses
    for (const entry of responses) {
      if (userInput.includes(entry.question)) {
        response = entry.response;
        break;
      }
    }

    // If no response is found in chatbot_responses.json, check laws.json
    if (!response) {
      fs.readFile(lawFilePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading laws JSON file:", err);
          return res.status(500).send("Internal Server Error");
        }

        const laws = JSON.parse(data);
        response =
          "Sorry, I couldn't find any relevant information. Can you try asking differently?";

        for (const law of laws) {
          if (userInput.includes(law.keyword)) {
            response = `Title: ${law.title}\nSummary: ${law.summary}`;
            break;
          }
        }

        // Send final response
        res.json({ message: response });
      });
    } else {
      // Send predefined chatbot response
      res.json({ message: response });
    }
  });
});

// Server setup
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
