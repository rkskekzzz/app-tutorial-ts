import axios from "axios";
import * as crypto from "crypto";

require("dotenv").config();

let channelTokenMap = new Map<string, [string, string, number]>();

const tutorialMsg = "This is a test message sent by a manager.";
const sendAsBotMsg = "This is a test message sent by a bot.";
const botName = "Bot";

const defaultWamArgs = ["rootMessageId", "broadcast", "isPrivate"];

async function getChannelToken(channelId: string): Promise<[string, string]> {
  const channelToken = channelTokenMap.get(channelId);
  if (
    channelToken === undefined ||
    channelToken[2] < new Date().getTime() / 1000
  ) {
    const [accessToken, refreshToken, expiresAt]: [string, string, number] =
      await requestIssueToken(channelId);
    channelTokenMap.set(channelId, [accessToken, refreshToken, expiresAt]);
    return [accessToken, refreshToken];
  } else {
    return [channelToken[0], channelToken[1]];
  }
}

async function requestIssueToken(
  channelId?: string
): Promise<[string, string, number]> {
  let body = {
    method: "issueToken",
    params: {
      secret: process.env.APP_SECRET,
      channelId: channelId,
    },
  };

  const headers = {
    "Content-Type": "application/json",
  };

  const response = await axios.put(process.env.APPSTORE_URL ?? "", body, {
    headers,
  });

  const accessToken = response.data.result.accessToken;
  const refreshToken = response.data.result.refreshToken;
  const expiresAt =
    new Date().getTime() / 1000 + response.data.result.expiresIn - 5;

  return [accessToken, refreshToken, expiresAt];
}

/**
 * [GUIDE] 커맨드 추가
 * body.params.commands 배열에 필요한 커맨드를 추가합니다.
 * 이때, registerCommands 메서드는 서버 실행시 1번 호출되기 때문에 서버를 재실행하면 변경된 커맨드가 등록됩니다.
 *
 * 추가로 아래 메서드는 PUT 형태로 동작하기 때문에, 새로운 커맨드를 추가할 때에도 이전 커맨드를 남겨두어야 합니다.
 * @param accessToken
 *
 * params에 대한 자세한 정보는 아래 링크에서 확인하세요
 * @see https://developers.channel.io/reference/app-command-kr
 */
async function registerCommand(accessToken: string) {
  const body = {
    method: "registerCommands",
    params: {
      appId: process.env.APP_ID,
      commands: [
        {
          name: "tutorial",
          scope: "desk",
          description: "This is a desk command of App-tutorial",
          /**
           * [GUIDE] 커맨드 생성
           * 커맨드를 생성할 떄 actionFunctionName을 지정해야합니다.
           * 이 이름은 functionHandler 메서드의 매개변수로 전달됩니다.
           * {@link: ./server.ts | functionHandler 함수}
           */
          actionFunctionName: "tutorial",
          alfMode: "disable",
          enabledByDefault: true,
        },
        {
          name: "anotherCommand",
          scope: "desk",
          description: "This is a new command",
          actionFunctionName: "newCommand",
          alfMode: "disable",
          enabledByDefault: true,
        },
      ],
    },
  };

  const headers = {
    "x-access-token": accessToken,
    "Content-Type": "application/json",
  };

  const response = await axios.put(process.env.APPSTORE_URL ?? "", body, {
    headers,
  });

  if (response.data.error != null) {
    throw new Error("register command error");
  }
}

async function sendAsBot(
  channelId: string,
  groupId: string,
  broadcast: boolean,
  rootMessageId?: string
) {
  const body = {
    method: "writeGroupMessage",
    params: {
      channelId: channelId,
      groupId: groupId,
      rootMessageId: rootMessageId,
      broadcast: broadcast,
      dto: {
        plainText: sendAsBotMsg,
        botName: botName,
      },
    },
  };

  const channelToken = await getChannelToken(channelId);

  const headers = {
    "x-access-token": channelToken[0],
    "Content-Type": "application/json",
  };

  const response = await axios.put(process.env.APPSTORE_URL ?? "", body, {
    headers,
  });

  if (response.data.error != null) {
    throw new Error("send as bot error");
  }
}

function verification(x_signature: string, body: string): boolean {
  const key: crypto.KeyObject = crypto.createSecretKey(
    Buffer.from(process.env.SIGNING_KEY ?? "", "hex")
  );
  const mac = crypto.createHmac("sha256", key);
  mac.update(body, "utf8");

  const signature: string = mac.digest("base64");
  return signature === x_signature;
}

function tutorial(wamName: string, callerId: string, params: any) {
  const wamArgs = {
    message: tutorialMsg,
    managerId: callerId,
  } as { [key: string]: any };

  if (params.trigger.attributes) {
    defaultWamArgs.forEach((k) => {
      if (k in params.trigger.attributes) {
        wamArgs[k] = params.trigger.attributes[k];
      }
    });
  }

  return {
    result: {
      type: "wam",
      attributes: {
        appId: process.env.APP_ID,
        name: wamName,
        wamArgs: wamArgs,
      },
    },
  };
}

/**
 * [GUIDE] function - 동작 추가
 * function을 추가하면 어떤 응답을 내려줄지를 잘 정의해야합니다.
 *
 * 흐름을 간단히 표현해보면
 * 1. command를 등록할 때 actionFunctionName을 정의하기 (즉, command와 function은 1:1 관계입니다.)
 * 2. 사용처에서 command를 호출하면 functionHandler 메서드에 정의된 메서드가 호출됩니다. (이 때 command에서 등록한 actionFunctionName이 전달됩니다.)
 * 3. 호출된 functionHandler 메서드에서 필요한 로직을 구현하고, 응답합니다.
 *  - 이때 wam을 띄우고 싶다면 function의 응답으로 type: "wam"을 포함한 객체를 반환합니다.(예시는 아래를 확인하세요)
 *  - 이때 wam이 아닌 다른 동작을 하고싶다면, sendAsBot 과 같은 형태를 참고하세요
 */
function newCommand(wamName: string, callerId: string, params: any) {
  return {
    result: {
      type: "wam",
      attributes: {
        appId: process.env.APP_ID,
        name: wamName,
        wamArgs: {
          page: "newCommandPage",
        },
      },
    },
  };
}

export {
  requestIssueToken,
  registerCommand,
  sendAsBot,
  tutorial,
  verification,
  newCommand,
};
