export interface DnsRecord {
  title: string
  type: string
  name: string
  content: string
  ok: boolean
  label: string
  priority: number | null,
  note: string
}

export interface DNS {
  SPF: boolean
  DKIM: boolean
  RP: boolean
  MX: boolean
  ok: boolean
}