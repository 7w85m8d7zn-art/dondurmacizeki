export interface QrTemplatePreset {
  id: string
  name: string
  backgroundColor: string
  qrBackgroundColor: string
  textColor: string
  accentColor: string
  frameThickness: number
  cornerRadius: number
}

export interface QrBranchOption {
  id: string
  name: string
  slug: string
  menuId: string
  menuName: string
}

export interface QrBuilderData {
  brandName: string
  branches: QrBranchOption[]
  templates: QrTemplatePreset[]
}

export interface QrBuilderState {
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
}
