import { useEffect, useState } from 'react'
import { AppProvider, type ThemeName } from '@channel.io/bezier-react'

import { isMobile } from './utils/userAgent'
import { getWamData } from './utils/wam'
import Send from './pages/Send'
import NewCommandPage from './pages/NewCommandPage'

function App() {
  const [theme, setTheme] = useState<ThemeName>('light')

  useEffect(() => {
    const appearance = getWamData('appearance')
    setTheme(appearance === 'dark' ? 'dark' : 'light')
  }, [])

  /**
   * [GUIDE] 페이지 전환
   * 페이지 전환은 getWamData 메서드를 통해서 페이지 이름을 가져오고, 이를 통해 페이지를 전환합니다.
   * 이때, wamData는 서버에서 응답으로 내려준 wamArgs의 값을 가져옵니다.
   * {@link: ./server.ts | functionHandler 함수}
   */
  const pageData = getWamData('page')

  return (
    <AppProvider themeName={theme}>
      <div style={{ padding: isMobile() ? '16px' : '0 24px 24px 24px' }}>
        {pageData === 'newCommandPage' && <NewCommandPage />}
        {pageData === 'send' && <Send />}
      </div>
    </AppProvider>
  )
}

export default App
