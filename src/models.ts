import { DAVCredentials, DAVAccount } from 'tsdav'

export interface calendar {
  connection: {
    serverUrl: string
    credentials: DAVCredentials
    authMethod?: 'Basic' | 'Oauth'
    defaultAccountType?: DAVAccount['accountType'] | undefined
  }
  calendar: string
}

export interface callibellaConfig {
  source: calendar
  destination: calendar
  timeRange: {
    daysInPast: number
    daysInFuture: number
  }
}
