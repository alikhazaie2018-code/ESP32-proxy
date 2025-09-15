import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";

const app = express();
app.use(bodyParser.json());

// Initialize Firebase Admin with env vars
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: "firebase-adminsdk-fbsvc@heart-and-spo2-monitor.iam.gserviceaccount.com",
    // IMPORTANT: FIREBASE_PRIVATE_KEY must contain literal "\n" sequences
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCx+CoD2UCAMJmS\nfeQpkhIqlqbVuLpwAF/bNfuFYUPyRe1Qomxs4+PD9dBPeLk/ob1DfzXD0uH0NJHH\nQ1v8zfveER6YeHw7tDU6vxwFXHgVeBEyN8oDFhoXn+9T0gUAGNj0xBbpwHLbIB+i\nCgeBJAr94A/PR52viX9r1RKKqdM7oqliTTKxMGLb1GYOqf/F9bXEo4N1fnqVZjEE\ndsYRnr/Mpyy0pV3KT09SNq10rH6LmV2ScC4+0488Y3tVo3qWw4zCOFI6AwIO61iM\n7MGnKq/m4SQFiZ4R1kWZrO5jNoUQI/ZWRa2Jvc0KUMbTZlDgfaYrkqoMRntY0+XA\nyx8vLBotAgMBAAECggEADGKNg/aMuU8IhOwLYoQ2jO2ufw2LteskwJPVZN8TtCq/\nHN8sxfgm+9ZhsIIhfCbkjauu4WmNzWmSIoiSwHlSN44/75Lk7F+6W5P8nnfkqHPS\nWIkO3x+c4buA03e4Xt0bzg7OXGaG565o3SUvCALq2+eJmh5tABAExMuPboRqfYoS\nvhYUP/UF3zR6IxIgWuooXjKfVYdSwW+MsSkjEQZqjHiS09airLtVjJ+PCdbUJxvD\n3Q1mqeMUvSZZCD9keRYZWd+cFbnofCRDJtcasR4s7901DTr4UNXO2MKtGejJDytA\nxpBNGV9anKxN10/9v6xm/XhDzDYVjRvg9Mh2LALOuQKBgQDrxKMlOIZx+dxTBopO\nGrEIt+ZalQAoKeuxyiqcJBHtbpU/f1k4Jqc8xm9MycdfK48WjoPp26xwjwlaMQjN\n4v3BRBVmqehT0YaG7Ix6/GzBkP9vXM9KSgE5GgruS7u3HpFVyZwkKue0VNjJa2ui\nt1BP9RjZcnVDT+LSTkHVY19BKQKBgQDBPc1leAf0xWDzPqsgvHUr4toCYGS10EJC\nrbLbYJsWxQH0Xq6kcmo+BZ6Pq0gGqr3CG2m423TFKcMHP0VNA48ZP/kwY4zwDP6z\nK2mbJVb4K5QqUDxk/udoU0KHcnXopozOgMlFBWTd7I1VOxVv+OyGMrNj7q4bsSDl\nYftyjH/dZQKBgDWwVaaINLWHvJB7kMswcNgXaLF/9MUwpqeZ7hIYdKyo3fvTuDF9\nO+AvH/FQkcIuXSs50PhUOfR33h1XxTV9V2PHaUgzsOBFemkHPQZUrT93EXP+ooW8\nTIMAVzTksh6FK3tpqdDipFkAaU2U1LH9JKDQo5QA6IsnifNyNrOtKWfhAoGAQmh0\nv5wiT9HM4Yr10EgzlCNffFWYBotNWhDLWGy4n3iQlWQ8bDMNo8bWmNTp6bCfiadW\nC7sPQ/p4FXN+41qHwMulXSW4933fwb73ieOpIZwITQpJ1wNqjwWd5WJGdu9VkFnd\n0SRrZ4C1iUbGtTY8QloGIB+UIdwbS/kCKnlyL6kCgYAIMUivvPs7cmE39S/J+Qe5\nwyRB4yTVSxRut626X8cumUqK/CN7JntTdoSrZl65fopHpFMjcGRkMuC/uCHmE42W\n6MQ3SmeaGTAQB3+UQaBiIlsiuGDYB+RMT+3Xq2V0TtSoum5POkUb4HmGCHEv5nvu\nhsfQXmdf7sB6QObTY1PVUQ==\n-----END PRIVATE KEY-----\n",
  }),
  databaseURL: "https://heart-and-spo2-monitor-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const db = admin.database();

app.get("/", (req, res) => res.send("ESP32 Proxy is running ✅"));

// POST /data { secret, heart, spo2 }
// writes to /HeartMonitor on Firebase (matches screenshot structure)
app.post("/data", (req, res) => {
  const { secret, heart, spo2 } = req.body;

  if (!secret || secret !== process.env.SECRET_KEY) {
    return res.status(403).json({ error: "Forbidden - bad secret" });
  }

  const payload = {
    heartRate: heart,
    spo2: spo2,
    time: new Date().toISOString()
  };

  db.ref("HeartMonitor").set(payload)
    .then(() => res.json({ success: true, written: payload }))
    .catch(err => {
      console.error("Firebase write error:", err);
      res.status(500).json({ error: err.message });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(Server running on port ${PORT}));
