import puppeteer, { Browser } from "puppeteer";
import {
  BROWSER_RECONNECT_LOOP_INTERVAL,
  QR_CONNECT_TIMEOUT,
  SEND_REQUEST_PROCESS_LOOP_INTERVAL,
} from "./constants";

let browser: Browser | null = null;
let browserWSEndpoint: string | null = null;
let busy: boolean = false;

let qrCodeTimeout: NodeJS.Timeout | null = null;

const requestQueue: {
  phoneNumber: string;
  message: string;
}[] = [];

const launchBrowser = async () => {
  browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { height: 1080, width: 1920 },
    args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
  });

  browserWSEndpoint = browser.wsEndpoint();
};

const reconnectToBrowser = async () => {
  if (browser?.connected || !browserWSEndpoint) return;

  try {
    browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: { height: 1080, width: 1920 },
    });
    console.log("Reconnected to browser.");
  } catch (error) {
    console.log("Failed to reconnect to browser:", error);
    console.log("Trying to launch new browser.");
    await launchBrowser();
  }
};

(async () => {
  await launchBrowser();
})();

(async () => {
  setInterval(async () => {
    await reconnectToBrowser();
  }, BROWSER_RECONNECT_LOOP_INTERVAL);
})();

(async () => {
  setInterval(async () => {
    if (busy || !requestQueue.length) {
      return;
    }

    const request = requestQueue[0];

    const { phoneNumber, message } = request;

    try {
      const page = await getInitializedPageInstance();

      if (!page) return null;

      busy = true;

      await page.goto(`https://web.whatsapp.com/send?phone=${phoneNumber}`, {
        waitUntil: "networkidle2",
      });

      await page.waitForSelector("input");

      await page.keyboard.type(message, { delay: 100 });

      await page.keyboard.press("Enter");

      requestQueue.shift();

      console.log("Message sent successfully", request);
    } catch (error) {
      console.log(error);
    } finally {
      busy = false;
    }
  }, SEND_REQUEST_PROCESS_LOOP_INTERVAL);
  //   Only 1 message to send at a time to avoid blocking
})();

const getInitializedPageInstance = async () => {
  if (!browser || busy) return null;

  try {
    const pages = await browser.pages();
    await Promise.all(pages.map((page) => page.close()));
  } catch (error) {
    console.log(error);
  }

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
  );

  return page;
};

const getQRCode = async () => {
  if (busy) return null;

  const page = await getInitializedPageInstance();

  if (!page) return null;

  busy = true;

  await page.goto("https://web.whatsapp.com", {
    waitUntil: "networkidle2",
  });

  const element = await page.waitForSelector("canvas");

  if (!element) return null;

  const qr = await element.screenshot({ type: "png" });

  if (qrCodeTimeout) clearTimeout(qrCodeTimeout);

  qrCodeTimeout = setTimeout(async () => {
    busy = false;
    console.log("QR code generation timeout");
  }, QR_CONNECT_TIMEOUT);

  return qr;
};

const sendMessage = (phoneNumber: string, message: string) => {
  if (browser && browser.connected === false) {
    console.log(
      "Browser disconnected, old browser should reconnect automatically soon."
    );
  }

  requestQueue.push({
    phoneNumber,
    message,
  });
};

export { getQRCode, sendMessage };
