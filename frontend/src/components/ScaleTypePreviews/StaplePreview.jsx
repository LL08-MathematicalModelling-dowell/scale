import StaplePre from '../../assets/StapelPreview.png'

const StaplePreview = () => {
  return (
    <>
       <div className="px-4 md:mt-28 mt-8 flex flex-col items-center gap-5">
       <h2 className="md:text-[22px] text-xl font-poppins text-center tracking-tight font-semibold">This is the preview of the NPS Scale</h2>
      <p className="font-poppins md:text-[16px] tracking-tight text-sm">How was your experience using our product? Please rate your experience below.</p>
      <div className="mt-4 md:px-10 px-2">
      <img src={StaplePre} alt="" />
      <div className="flex justify-between items-center mt-2">
        <p className="font-poppins text-sm md:text-[16px] tracking-tight">Bad</p>
        <p className="font-poppins text-sm md:text-[16px] tracking-tight">Excellent</p>
      </div>
      </div>
    </div> 
    </>
  )
}

export default StaplePreview
