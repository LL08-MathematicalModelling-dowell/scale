import PreferenceSelect from "@/components/PreferenceSelect/PreferenceSelect";
import { useState } from "react";
import PropTypes from 'prop-types'

const ScaleConfiguration = ({formData, handleInputChange}) => {

  const [images, setImages] = useState([]);


  const Ratting = [
    {
      label: `On a scale of 0 -10, how would you rate ${formData.productName === "" ? "{product_name}" : formData.productName}?`,
      value: `On a scale of 0 -10, how would you rate ${formData.productName === "" ? "{product_name}" : formData.productName}?`,
    },
    {
      label: `On a scale of 0 - 10, how would you rate ${formData.brandName === "" ? "{brand_name}" : formData.brandName}`,
      value: `On a scale of 0 - 10, how would you rate ${formData.brandName === "" ? "{brand_name}" : formData.brandName}`,
    },
    {
      label: `On a scale of 0 - 10, how would you rate ${formData.productName === "" ? "{product_name}" : formData.productName} from ${formData.brandName === "" ? "{brand_name}" : formData.brandName}?`,
      value: `On a scale of 0 - 10, how would you rate ${formData.productName === "" ? "{product_name}" : formData.productName} from ${formData.brandName === "" ? "{brand_name}" : formData.brandName}?`,
    },
  ];



  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imagePreviews = files.map((file) =>
      URL.createObjectURL(file)
    );
    setImages((prevImages) => [...prevImages, ...imagePreviews]);
  };

  const removeImage = (image) => {
    setImages(images.filter((img) => img !== image));
  };


    
  return (
    <div className="md:max-w-full max-w-full flex justify-center  bg-gray-50 md:px-0 px-4">
      <div className="flex flex-col  justify-center gap-6">
        <h2 className="text-dowellDeepGreen md:text-[20px] font-semibold font-poppins tracking-tight text-center">Scale Configuration</h2>
     {/* Title Questiion */}
     <div className="flex flex-col gap-2 ">
     <p className="font-poppins tracking-tight text-sm font-medium">This is how the question will be.</p>
     <p className="font-poppins tracking-tight text-lg font-semibold">{formData.questionToDisplay === " " ? "On a scale of 0 -10, how would you rate our product/service?" : formData.questionToDisplay}</p>
     </div>
     {/* Question Type */}

     <div className="flex flex-col gap-2">
          <label htmlFor="questionToDisplay" className="md:text-md  font-poppins tracking-tighter">
            Choose the type of question you want
          </label>
          <PreferenceSelect name="questionToDisplay" data={Ratting} customClass="md:w-[610px] w-[300px] font-poppins tracking-tight"  placeholder="On a scale of 0 -10, how would you rate our product/service?" type="rating" handleInputChange={handleInputChange} value={formData.questionToDisplay} />
        </div>
{/* Image Upload */}
<div className="flex gap-2 flex-col">
      <p className="font-poppins tracking-tight text-sm font-medium">
        Upload the images you want to add in the scale
      </p>
      {/* Upload Box */}
      <div className="border border-dashed border-green-400 p-4 relative rounded-md">
        <input
          type="file"
          id="imageUpload"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />
        <label
          htmlFor="imageUpload"
          className="flex flex-col items-center justify-center gap-2 cursor-pointer"
        >
          <div className="text-green-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v-9a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 9.75L12 14.25l-3-3"
              />
            </svg>
          </div>
          <p className="font-medium text-green-800 font-poppins tracking-tight">
            Upload Image
          </p>
          <p className="text-xs text-gray-500 font-poppins">
            At least 2 images
          </p>
        </label>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`uploaded ${index}`}
                className="w-full h-24 object-cover rounded-md shadow-sm"
              />
              <button
                onClick={() => removeImage(image)}
                className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>


      </div>
    </div>
  );
};

ScaleConfiguration.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
};

export default ScaleConfiguration;

