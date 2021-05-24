import puppeteer from "puppeteer";

export class Puppet {
  constructor() {}

  #page;

  #startCapture() {
    setInterval(async () => {
      try {
        await this.#page.screenshot({ path: "./public/scanthis.png" });
      } catch (error) {
        console.log(error);
      }
    }, 3000);
  }

  #checkForRescanButton() {
    try {
      this.#page.evaluate(() => {
        const interval = setInterval(() => {
          const codeCanvas = document.querySelectorAll("canvas");

          if (codeCanvas.length) {
            const reloadButton =
              codeCanvas[0].previousElementSibling.previousElementSibling.querySelector(
                "button"
              );

            if (reloadButton) {
              reloadButton.click();
              console.log("Clicked");
            }
          } else {
            console.log("Canvas not present");
            clearInterval(interval);
          }
        }, 2000);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async #waitToLoad() {
    try {
      await this.#page.waitForSelector(
        'div.copyable-text.selectable-text[contenteditable="true"]',
        {
          timeout: 0,
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  async sendMessage(to, message) {
    try {
      await this.#page.goto(`https://web.whatsapp.com/send?phone=${to}`, {
        waitUntil: "networkidle2",
      });

      await this.#waitToLoad();

      await this.#page.keyboard.type(message);

      await this.#page.keyboard.press("Enter");

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async init() {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { height: 600, width: 800 },
        args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();

      await page.goto("https://web.whatsapp.com", {
        waitUntil: "networkidle2",
      });

      this.#page = page;

      this.#startCapture();
      this.#checkForRescanButton();
      await this.#waitToLoad();

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
