import { PharmacyView } from "@/components/pharmacy/pharmacy-view"
import { BackButton } from "@/components/common/back-button"

export default function PharmacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-2">
        <div className="mb-2">
          <BackButton />
        </div>
        <PharmacyView />
      </div>
    </div>
  )
}
