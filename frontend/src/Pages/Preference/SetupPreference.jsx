import Navbar from "@/components/Navbar/Navbar"
import PreferenceStepper from "@/components/PreferenceStepper/PreferenceStepper"


const SetupPreference = () => {
  return (
    <div className="md:max-w-full max-w-full min-h-screen bg-gray-50">
              <Navbar />
              <div className="mt-7">
                <PreferenceStepper/>
              </div>
    </div>
  )
  
}

export default SetupPreference