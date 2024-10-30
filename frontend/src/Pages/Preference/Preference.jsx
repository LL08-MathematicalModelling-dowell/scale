import PreferenceSelect from "@/components/PreferenceSelect/PreferenceSelect";
import Logo from "../../assets/VOC.png";

const Preference = () => {
  const scaleTypes = [
    {
      label: "NPS Scale",
      value: "nps",
    },
    {
      label: "Likert Scale",
      value: "likert",
    },
  ];
  const DataTypes = [
    {
      label: "real_data",
      value: "real_data",
    },
  ];
  const Ratting = [
    {
      label: "On a scale of 0 -10, how would you rate {product_name}?",
      value: "product_name",
    },
    {
      label: "On a scale of 0 -10, how would you rate {brand_name}?",
      value: "brand_name",
    },
    {
      label: "On a scale of 0 -10, how would you rate {product_name} from {brand_name}?",
      value: "brand_name&product_name",
    },
  ];

  const handleInputChange = (value) => {
    console.log(`Changed value: ${value}`);
  };

  return (
    <div className="min-h-screen max-w-full">
      <div className="px-10 py-8 border-b-2 border-gray-300">
        <div className="flex gap-5 items-center">
          <img src={Logo} alt="" className="w-24" />
          <h2 className="font-bold text-2xl font-poppins tracking-tight">Settings</h2>
        </div>
      </div>
      <div className="mt-8 px-10 w-full flex flex-col gap-5">
        <h1 className="text-2xl font-bold font-poppins tracking-tight">Set Preferences</h1>
        <div className="flex flex-col gap-2">
          <label htmlFor="" className="font-poppins tracking-tighter">
            Choose a scale Type
          </label>
          <PreferenceSelect
            data={scaleTypes}
            triggerClass="w-[300px] font-poppins tracking-tight"
            placeholder="Select scale type"
            type="select"
            handleInputChange={handleInputChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="" className="font-poppins tracking-tighter">
            Choose a data Type
          </label>
          <PreferenceSelect
            data={DataTypes}
            triggerClass="w-[300px] font-poppins tracking-tight"
            placeholder="Select data type"
            type="select"
            handleInputChange={handleInputChange}
          />
        </div>

        <div className="flex gap-5">
          {/* left */}
          <div className="flex flex-col gap-2">
            <label htmlFor="" className="font-poppins tracking-tighter">
              Your Brand Name
            </label>
            <PreferenceSelect
              data={DataTypes}
              inputClass="w-[300px] font-poppins text-sm tracking-tight h-10 px-2 border border-gray-300 rounded-md"
              placeholder="Enter brand name"
              type="input"
              handleInputChange={handleInputChange}
            />
          </div>
          {/* right */}
          <div className="flex flex-col gap-2">
            <label htmlFor="" className="font-poppins tracking-tighter">
              Your Product Name
            </label>
            <PreferenceSelect
              data={DataTypes}
              inputClass="w-[300px] font-poppins text-sm tracking-tight h-10 px-2 border border-gray-300 rounded-md"
              placeholder="Enter product name"
              type="input"
              handleInputChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="" className="font-poppins tracking-tighter">
            Choose the type of question you want
          </label>
          <PreferenceSelect
            data={Ratting}
            customClass="w-[610px] font-poppins tracking-tight"
            type="rating"
            handleInputChange={handleInputChange}
            placeholder="On a scale of 0 -10, how would you rate our product/ service?"
          />
        </div>
      </div>
    </div>
  );
};

export default Preference;
