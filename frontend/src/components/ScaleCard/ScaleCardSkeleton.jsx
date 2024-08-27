const ScaleCardSkeleton = () => {
    return (
      <div className=" border shadow-xl rounded-lg w-full h-full flex flex-col">
      <div className="w-full h-40 bg-gray-200 rounded-t-lg animate-pulseReduced"> </div>
      <div className="flex flex-col flex-grow p-2 animate-pulseReduced">
        <div className="h-6 w-40 bg-gray-200 rounded  mb-1 animate-pulseReduced"> </div>
        <div className="h-2 bg-gray-200 rounded w-full mb-1 animate-pulseReduced"> </div>
        <div className="h-2 bg-gray-200 rounded w-full mb-1 animate-pulseReduced"> </div>
        <div className="h-2 bg-gray-200 rounded w-full mb-1 animate-pulseReduced"> </div>
        <div className="h-2 bg-gray-200 rounded w-full mb-3 animate-pulseReduced"> </div>
        <div className="mt-auto flex justify-between gap-2 animate-pulseReduced">
          <div className="py-1 px-6 h-6 bg-gray-200 rounded animate-pulseReduced"> </div>
          <div className="py-1 px-6 h-6 bg-gray-200 rounded animate-pulseReduced"></div>
        </div>
      </div>
    </div>
    );
  };
  
  export default ScaleCardSkeleton;
  