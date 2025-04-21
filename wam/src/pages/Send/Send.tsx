import { useEffect, useMemo, useCallback } from 'react'
import {
  VStack,
  HStack,
  Button,
  Text,
  Icon,
  ButtonGroup,
} from '@channel.io/bezier-react'
import { CancelIcon, SendIcon } from '@channel.io/bezier-icons'

import {
  callFunction,
  callNativeFunction,
  getWamData,
  setSize,
  close,
} from '../../utils/wam'
import * as Styled from './Send.styled'

function Send() {
  useEffect(() => {
    setSize(390, 172)
  }, [])

  const chatTitle = useMemo(() => getWamData('chatTitle') ?? '', [])

  const appId = useMemo(() => getWamData('appId') ?? '', [])
  const channelId = useMemo(() => getWamData('channelId') ?? '', [])
  const managerId = useMemo(() => getWamData('managerId') ?? '', [])
  const message = useMemo(() => getWamData('message') ?? '', [])
  const chatId = useMemo(() => getWamData('chatId') ?? '', [])
  const chatType = useMemo(() => getWamData('chatType') ?? '', [])
  const broadcast = useMemo(() => Boolean(getWamData('broadcast') ?? false), [])
  const rootMessageId = useMemo(() => getWamData('rootMessageId'), [])

  const handleSend = useCallback(
    async (sender: string): Promise<void> => {
      if (chatType === 'group') {
        switch (sender) {
          case 'bot':
            /**
             * [GUIDE] function
             * callFunction 메서드는 서버에서 정의한 function을 호출합니다.
             *
             * 2번째 인자로 method를 넘겨줍니다.
             * 서버측에서는 이 method를 통해서 어떤 메서드를 호출할지 결정합니다.
             * {@link: ../../server/src/server.ts | server.ts 23번 라인}
             */
            await callFunction(appId, 'sendAsBot', {
              input: {
                groupId: chatId,
                broadcast,
                rootMessageId,
              },
            })
            break
          /**
           * [GUIDE] nativeFunction
           * callNativeFunction 메서드는 채널에서 제공하는 기본 기능을 호출합니다.
           * native로 제공하는 기능은 아래 링크에서 자세히 확인할 수 있습니다.
           * @see https://developers.channel.io/reference/app-function-kr#5-%ED%98%84%EC%9E%AC-%EC%A0%9C%EA%B3%B5%EB%90%98%EB%8A%94-native-functions
           */
          case 'manager':
            await callNativeFunction('writeGroupMessageAsManager', {
              channelId,
              groupId: chatId,
              rootMessageId,
              broadcast,
              dto: {
                plainText: message,
                managerId,
              },
            })
            break
          default:
            // NOTE: should not reach here
            console.error('Invalid message sender')
        }
      } else if (chatType === 'directChat') {
        // FIXME: Implement
      } else if (chatType === 'userChat') {
        // FIXME: Implement
      }
    },
    [
      appId,
      broadcast,
      channelId,
      chatId,
      chatType,
      managerId,
      message,
      rootMessageId,
    ]
  )

  return (
    <VStack spacing={16}>
      <HStack justify="between">
        <Text
          color="txt-black-darkest"
          typo="24"
          bold
        >
          Tutorial
        </Text>
        <Button
          colorVariant="monochrome-dark"
          styleVariant="tertiary"
          leftContent={CancelIcon}
          onClick={() => close()}
        />
      </HStack>
      <HStack justify="center">
        <ButtonGroup>
          <Button
            colorVariant="blue"
            styleVariant="primary"
            text="Send as a manager"
            onClick={async () => {
              await handleSend('manager')
              close()
            }}
          />
          <Button
            colorVariant="blue"
            styleVariant="primary"
            text="Send as a bot"
            onClick={async () => {
              await handleSend('bot')
              close()
            }}
          />
        </ButtonGroup>
      </HStack>
      <HStack justify="center">
        <Styled.CenterTextWrapper>
          <Icon
            source={SendIcon}
            color="txt-black-dark"
            size="xs"
          />
          <Text
            as="span"
            color="txt-black-dark"
          >
            {chatTitle}
          </Text>
        </Styled.CenterTextWrapper>
      </HStack>
    </VStack>
  )
}

export default Send
