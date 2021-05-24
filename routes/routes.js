import koaRouter from "koa-router";

import { puppet } from "../server.js";

const router = new koaRouter();

router.post("/send", async (ctx) => {
  try {
    const phoneNumber = ctx.request.body.phoneNumber;
    const message = ctx.request.body.message;

    puppet.sendMessage(phoneNumber, message);

    ctx.status = 200;

    ctx.response.body = {
      message: "success",
      error: false,
    };
  } catch (error) {
    ctx.status = 500;

    ctx.response.body = {
      message: "failed",
      error: true,
    };
  }
});

router.get("/scanthis.png", async (ctx, next) => {
  try {
    const token = ctx.query.token;

    if (!token || token !== process.env.TOKEN) {
      return (ctx.status = 401);
    }

    await next();
  } catch (error) {
    ctx.status = 500;
  }
});

export { router };
