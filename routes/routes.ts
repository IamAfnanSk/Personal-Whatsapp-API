import express from "express";

import { getQRCode, sendMessage } from "../whatsapp";
import { TimeoutError } from "puppeteer";

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const message = req.body.message;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        data: "phoneNumber and message are required",
      });
    }

    const regex = /^[6-9]\d{9}$/;

    if (!regex.test(phoneNumber)) {
      return res.status(400).json({
        data: "phoneNumber is invalid, should be a valid indian number",
      });
    }

    sendMessage(phoneNumber, message);

    res.json({
      data: "Message queued successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

router.get("/scanthis.png", async (req, res) => {
  try {
    const token = req.query.token;

    if (!token || token !== process.env.TOKEN) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const qr = await getQRCode();

    if (!qr) {
      return res.status(500).json({
        error: "Can't get QR code, try again after sometime",
      });
    }

    res.set("Content-Type", "image/png");
    res.send(qr);
  } catch (error) {
    console.log(error);

    if (error instanceof TimeoutError) {
      return res.status(500).json({
        error:
          "Can't get QR code, either logged in already or something went wrong",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

export { router };
