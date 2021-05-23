import koa from "koa";
import koaRouter from "koa-router";
import serve from "koa-static";
import cors from "koa2-cors";
import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import { Puppet } from "./app.js";

const app = new koa();
const router = new koaRouter();
const puppet = new Puppet();
const port = process.env.PORT || 7861;

console.log(process.env.WHATSAPP_TO_NAME);

app.use(cors());
app.use(router.routes());
app.use(serve("./public/"));

router.get("/send/:message", async (ctx) => {
  try {
    const message = ctx.params.message;

    await puppet.sendMessage(message);

    ctx.status = 200;
  } catch (error) {
    ctx.status = 500;
  }
});

router.get("/scanthis.png", async (ctx, next) => {
  try {
    const token = ctx.query.token;

    console.log(token);
    if (!token || token !== "***REMOVED***") {
      return (ctx.status = 401);
    }

    await next();
  } catch (error) {
    ctx.status = 500;
  }
});

app.listen(port, () => {
  console.log(`Server at http://localhost:${port}`);
});

await puppet.init();
