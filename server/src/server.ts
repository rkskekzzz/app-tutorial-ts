import express, { Request, Response } from "express";
import path from "path";
import {
  requestIssueToken,
  registerCommand,
  sendAsBot,
  tutorial,
  verification,
  newCommand,
} from "./util";

require("dotenv").config();

const app = express();

const WAM_NAME = "wam_name";

async function startServer() {
  const [accessToken, refreshToken, expiresAt]: [string, string, number] =
    await requestIssueToken();
  await registerCommand(accessToken);
}

async function functionHandler(body: any) {
  const method = body.method;
  const callerId = body.context.caller.id;
  const channelId = body.context.channel.id;

  /**
   * [GUIDE] function
   * registerCommand에서 등록된 actionFunctionName을 통해서 어떤 메서드를 호출할지
   * 결정하면 됩니다.
   */
  switch (method) {
    /**
     * [GUIDE] function
     * function은 두 가지 형태로 호출될 수 있습니다.
     * 1. 커맨드로 부터 호출되는 경우
     * 2. callFunction 메서드를 통해서 호출되는 경우
     *
     * registerCommand에서 볼 수 있듯이, tutorial과 newCommand는 커맨드로 부터 호출되는 function 입니다.
     *
     * sendAsBot은 callFunction 메서드를 통해서 호출되는 function 입니다.
     * {@link: ../../wam/src/pages/Send/Send.tsx | Send 페이지 42번 라인}
     */
    case "tutorial":
      return tutorial(WAM_NAME, callerId, body.params);
    case "newCommand":
      return newCommand(WAM_NAME, callerId, body.params);
    case "sendAsBot":
      await sendAsBot(
        channelId,
        body.params.input.groupId,
        body.params.input.broadcast,
        body.params.input.rootMessageId
      );
      return { result: {} };
  }
}

async function server() {
  try {
    await startServer();

    app.use(express.json());
    app.use(
      `/resource/wam/${WAM_NAME}`,
      express.static(path.join(__dirname, "../../wam/dist"))
    );

    app.put("/functions", (req: Request, res: Response) => {
      if (
        typeof req.headers["x-signature"] !== "string" ||
        verification(req.headers["x-signature"], JSON.stringify(req.body)) ===
          false
      ) {
        res.status(401).send("Unauthorized");
      }
      functionHandler(req.body).then((result) => {
        res.send(result);
      });
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server is running at http://localhost:${process.env.PORT}`);
    });
  } catch (error: any) {
    console.error("Error caught:", error);
  }
}

export { server };
