import puppeteer from "puppeteer";

export class Puppet {
  page;

  async sendMessage(message) {
    await this.page.keyboard.type(message);

    await this.page.waitForTimeout(3000);

    const submitBtn = await this.page.waitForSelector(
      "div.EBaI7 button._1E0Oz",
      { timeout: 0 }
    );

    submitBtn.click();
  }

  async capture() {
    await this.page.screenshot({ path: "./public/scanthis.png" });
  }

  async init() {
    const browser = await puppeteer.launch({
      headless: false,
    });

    const page = await browser.newPage();

    this.page = page;

    await this.page.goto("https://web.whatsapp.com", {
      waitUntil: "networkidle2",
    });

    await this.page.waitForSelector(".landing-main .O1rXL", { timeout: 0 });

    await this.page.waitForTimeout(1000);

    setInterval(async () => {
      await this.capture();
    }, 5000);

    const list = await this.page.waitForSelector(
      `span[title="${process.env.WHATSAPP_TO_NAME}"]`,
      { timeout: 0 }
    );

    await this.page.waitForTimeout(2000);

    list.click();

    await this.page.waitForTimeout(3000);
  }
}
