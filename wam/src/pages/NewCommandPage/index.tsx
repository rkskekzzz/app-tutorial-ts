import { Button, VStack, Text } from '@channel.io/bezier-react'
import { close } from '../../utils/wam'

const NewCommandPage = () => {
  return (
    <VStack>
      <Text>NewCommandPage</Text>
      <Button
        colorVariant="blue"
        styleVariant="primary"
        text="닫기"
        onClick={() => close()}
      />
    </VStack>
  )
}

export default NewCommandPage
