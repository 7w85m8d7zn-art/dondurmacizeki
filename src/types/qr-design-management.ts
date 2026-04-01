export interface QrDesignItem {
  id: string
  branchId: string
  branchName: string
  menuId: string
  menuName: string
  generatedUrl: string
  title: string
  subtitle: string
  showLogo: boolean
  showIcon: boolean
  backgroundColor: string
  qrBackgroundColor: string
  textColor: string
  accentColor: string
  frameThickness: number
  cornerRadius: number
  templateId: string
  logoUrl: string
  isActive: boolean
  updatedAt: string
}

export interface QrDesignFormValues {
  branchId: string
  menuId: string
  generatedUrl: string
  title: string
  subtitle: string
  showLogo: boolean
  showIcon: boolean
  backgroundColor: string
  qrBackgroundColor: string
  textColor: string
  accentColor: string
  frameThickness: number
  cornerRadius: number
  templateId: string
  logoUrl: string
  isActive: boolean
}

export interface QrDesignManagementData {
  designs: QrDesignItem[]
}
