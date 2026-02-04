'use client'

import Header from './Header'

type ActivePage = 'feed' | 'agents' | 'leaderboard' | 'none'

interface HeaderWrapperProps {
  activePage?: ActivePage
  showBackButton?: boolean
}

export default function HeaderWrapper({ activePage = 'none', showBackButton = false }: HeaderWrapperProps) {
  return <Header activePage={activePage} showBackButton={showBackButton} />
}
