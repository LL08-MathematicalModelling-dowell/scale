import { useState, useEffect } from 'react';
import { UserScaleData } from "@/data/DummyData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NoImage from "./../../assets/NoImg.png";

const ScaleSelectForm = () => {
  const [selectedScale, setSelectedScale] = useState(null);

  // Load selected scale from localStorage if available
  useEffect(() => {
    const savedScaleName = localStorage.getItem('selectedScaleName');
    if (savedScaleName) {
      const savedScale = UserScaleData.scales.find(item => item.scaleName === savedScaleName);
      setSelectedScale(savedScale);
    }
  }, []);

  const data = UserScaleData.scales.map(item => ({
    scaleName: item.scaleName,
    scaleDescription: item.scaleDescription,
    scaleImg: item.scaleImg,
  }));

  const handleScaleChange = (value) => {
    const selected = data.find(item => item.scaleName === value);
    setSelectedScale(selected);
    localStorage.setItem('selectedScaleName', value); 
  };

  return (
    <div className="flex justify-center flex-col md:flex-row gap-4 md:mx-20">
      <div className="flex flex-col gap-4 md:w-2/3 md:pr-28">
        <h2 className="font-montserrat tracking-tight text-2xl font-bold">Choose Scale</h2>
        <div>
          <Select value={selectedScale?.scaleName|| ' '} onValueChange={handleScaleChange}>
            <SelectTrigger className="w-[300px] focus:ring-1 focus:ring-green-200 outline-none border-[1px] uppercase">
              <SelectValue placeholder="Select scale type" />
            </SelectTrigger>
            <SelectContent>
              {data.map((item, index) => (
                <SelectItem key={index} value={item.scaleName} className="font-normal font-poppins uppercase" >
                  {item.scaleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <h2 className="font-montserrat tracking-tight text-2xl font-bold">Scale Description</h2>
        {selectedScale && (
          <p className="font-poppins md:text-[14.5px] text-[13.5px] tracking-tight">
            {selectedScale.scaleDescription}
          </p>
        )}
      </div>
      <div className='flex flex-col md:w-1/3'>
        <div>
          {(!selectedScale || !selectedScale.scaleImg || selectedScale.scaleImg.trim() === '') ? (
            <img src={NoImage} alt="No scale image" className='w-full h-[300px] object-cover' />
          ) : (
            <img 
              src={selectedScale.scaleImg} 
              alt="Scale Image" 
              className='w-full h-[300px] object-cover rounded-xl'
              onError={(e) => { e.target.onerror = null; e.target.src = NoImage; }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ScaleSelectForm;
