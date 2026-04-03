export interface AvailablePlayer {
  id: number
  name: string
  subType: string
}

export interface LogInputProps {
  onLogReady: (log: string, duration?: number) => void
  disabled: boolean
  maxLength: number
  inputMode: 'paste' | 'wcl'
  onWclUrl: (url: string) => void
  wclLoading: boolean
  wclError: string | undefined
  availablePlayers: AvailablePlayer[] | undefined
  onPlayerSelect: (playerId: number) => void
  onInputModeChange: (mode: 'paste' | 'wcl') => void
}
