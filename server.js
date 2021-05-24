import koa from "koa";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import cors from "koa2-cors";

import { config as dotenvConfig } from "dotenv";

dotenvConfig();

import { router } from "./routes/routes.js";

import { Puppet } from "./app.js";

const app = new koa();

const puppet = new Puppet();
const port = process.env.PORT || 7861;

app.use(cors());
app.use(bodyParser());
app.use(serve("./public/"));

app.use(router.routes());

app.listen(port, () => {
  console.log(`✨ Server running at http://localhost:${port}`);
});

await puppet.init();

export { puppet };
