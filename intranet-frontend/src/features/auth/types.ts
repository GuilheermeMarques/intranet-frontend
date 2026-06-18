export interface CurrentUser {
  id: string
  name: string
  email: string
  jobTitle: string | null
  department: string | null
  avatar: string | null
  permissions: string[]
}
