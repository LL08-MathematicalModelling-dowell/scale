import PreferenceSelect from "@/components/PreferenceSelect/PreferenceSelect"


const BasicInformation = ({formData, handleInputChange}) => {

    
  const scaleTypes = [
    {label: "NPS Scale", value: "nps"},
    {label: "Likert Scale", value: "likert"},
  ];

  const DataTypes = [
    {label: "Real Data", value: "Real_Data"},
    {label: "Learning Data", value: "Learning_Data"},
    {label: "Testing Data", value: "Testing_Data"},
    {label: "Archived Data", value: "Archived_Data"},
  ];

  const scalePointer = [
    {
      label: "2 Pointers",
      value: 2
    },
    {
      label: "3 Pointers",
      value: 3
    },
    {
      label: "4 Pointers",
      value: 4
    }

  ]



  return (
    <div className="md:max-w-full max-w-sm  bg-gray-50">
      <div className="flex flex-col items-center justify-center gap-3">
        <h2 className="text-dowellDeepGreen md:text-[20px] font-semibold font-poppins tracking-tight">Basic Information</h2>
          <div className="flex flex-col gap-4">
            {/* ScaleType */}
          <div className="flex flex-col gap-2 ">
          <label htmlFor="scaleType" className="font-poppins tracking-tighter">
            Choose a scale Type
          </label>
          <PreferenceSelect  name="scaleType" data={scaleTypes} triggerClass="md:w-[620px] w-[320px]  font-poppins tracking-tight" placeholder="Select scale type" type="select" handleInputChange={handleInputChange}   />
        </div>
        {/* Data Type */}
        <div className="flex flex-col gap-2">
          <label htmlFor="dataType" className="font-poppins tracking-tighter">
            Choose a data Type
          </label>
          <PreferenceSelect name="dataType" data={DataTypes} triggerClass="md:w-[620px] w-[320px] font-poppins tracking-tight" placeholder="Select data type" type="select" handleInputChange={handleInputChange} />
        </div>

        {/* scale Type Pointer */}
        <div className="flex flex-col gap-2">
          <label htmlFor="scalePointer" className="font-poppins tracking-tighter">
            Choose a Scale Pointer
          </label>
          <PreferenceSelect name="scalePointer" data={scalePointer} triggerClass="md:w-[620px] w-[320px] font-poppins tracking-tight" placeholder="Select Scale Pointer" type="select" handleInputChange={handleInputChange} />
        </div>

        {/* Product Name and Brand Name */}

        <div className="flex gap-5 flex-col md:flex-row">
          <div className="flex flex-col gap-2">
            <label htmlFor="brandName" className="font-poppins tracking-tighter">
              Your Brand Name
            </label>
            <PreferenceSelect name="brandName" type="input" inputClass="w-[300px] font-poppins text-sm tracking-tight h-10 px-2 border border-gray-300 rounded-md" placeholder="Enter brand name" handleInputChange={handleInputChange}/>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="productName" className="font-poppins tracking-tighter">
              Your Product Name
            </label>
            <PreferenceSelect name="productName" type="input" inputClass="w-[300px] font-poppins text-sm tracking-tight h-10 px-2 border border-gray-300 rounded-md" placeholder="Enter product name" handleInputChange={handleInputChange}  />
          </div>
        </div>

          </div>
      </div>
    </div>
  )
}

export default BasicInformation