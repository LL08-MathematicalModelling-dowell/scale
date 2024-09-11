import {useState, useEffect} from "react";
import ScaleInput from "./SelectField/ScaleInput";
import {FaPlusCircle, FaMinusCircle} from "react-icons/fa";

const Configure = () => {
  const [channels, setChannels] = useState([
    {
      id: 1,
      name: "",
      instances: [""], 
    },
  ]);

  const [configureData, setConfigureData] = useState(() => {
    const savedConfig = localStorage.getItem("configureData");
    if(savedConfig){
      return JSON.parse(savedConfig);
    }else {
      return {
        scaleName: "",
        numberOfResponses: "",
        channels: [
          {
            name: channels[0]?.name,
            instances: channels[0]?.instances,
          },
        ],
      }
    }
  });

  useEffect(() => {
    setConfigureData((prevData) => ({
      ...prevData,
      channels: channels.map((channel) => ({
        name: channel.name,
        instances: channel.instances,
      })),
    }));
  }, [channels]);

  const createChannel = () => {
    setChannels([...channels, {id: channels.length + 1, name: "", instances: [""]}]);
  };
  const removeChannel = () => {
    if (channels.length > 1) {
      setChannels(channels.slice(0, -1));
    }
  };
  const addInstanceToChannel = (channelId) => {
    setChannels(channels.map((channel) => (channel.id === channelId ? {...channel, instances: [...channel.instances, ""]} : channel)));
  };
  const removeInstanceFromChannel = (channelId) => {
    setChannels(channels.map((channel) => (channel.id === channelId && channel.instances.length > 1 ? {...channel, instances: channel.instances.slice(0, -1)} : channel)));
  };
  const handleChannelNameChange = (channelId, newName) => {
    setChannels(channels.map((channel) => (channel.id === channelId ? {...channel, name: newName} : channel)));
  };
  const handleInstanceNameChange = (channelId, instanceIndex, newName) => {
    setChannels(
      channels.map((channel) =>
        channel.id === channelId
          ? {
              ...channel,
              instances: channel.instances.map((instance, index) => (index === instanceIndex ? newName : instance)),
            }
          : channel
      )
    );
  };
  const handleScaleNameChange = (e) => {
    setConfigureData({
      ...configureData,
      scaleName: e.target.value,
    });
  };
  const handleNumberOfResponsesChange = (e) => {
    setConfigureData({
      ...configureData,
      numberOfResponses: e.target.value,
    });
  };
  useEffect(() => {
    localStorage.setItem("configureData", JSON.stringify(configureData));
    console.log(configureData);
  }, [configureData]);

  return (
    <div className="w-full px-4 md:px-8 overflow-x-hidden">
      <h2 className="font-poppins text-2xl tracking-tight font-bold text-dowellDeepGreen text-center">Configure your scale</h2>

      <div className="mt-12 flex flex-col gap-8 justify-center items-center ">
        {/* Scale name and Specify number of responses */}
        <div className="md:w-[80%] w-full flex flex-col md:flex-row gap-8">
          <ScaleInput type="text" placeholder="Enter scale name" label="Scale Name" value={configureData.scaleName} onChange={handleScaleNameChange} />
          <ScaleInput type="text" placeholder="Enter number" label="No. of responses per instance" value={configureData.numberOfResponses} onChange={handleNumberOfResponsesChange} />
        </div>

        <div className="md:w-[80%]  w-full flex flex-col ">
          <div className="md:flex-row flex flex-col gap-8">
            {channels.length > 0 && <ScaleInput type="text" placeholder="Enter first channel name" label="Specify Channel" value={channels[0]?.name} onChange={(e) => handleChannelNameChange(channels[0].id, e.target.value)} />}
            <div className="flex flex-col w-full gap-5">
              {channels[0]?.instances.map((instance, index) => (
                <ScaleInput
                  key={index}
                  type="text"
                  placeholder={`Instance ${index + 1}`} // Keep instance index in placeholder
                  label={`Specify instance ${index + 1}`} // Use instance index in label
                  value={instance}
                  onChange={(e) => handleInstanceNameChange(channels[0].id, index, e.target.value)}
                />
              ))}
            </div>
          </div>

          {/* Add/Remove instance buttons */}
          <div className="flex md:flex-row flex-col gap-3 items-center justify-end mt-4">
            <p className="font-poppins font-medium text-sm">Add more instances</p>
            <div className="flex flex-row gap-3">
              <FaPlusCircle className="size-7 text-dowellDeepGreen cursor-pointer" onClick={() => addInstanceToChannel(channels[0].id)} />
              <FaMinusCircle className="size-7 text-red-500 cursor-pointer" onClick={() => removeInstanceFromChannel(channels[0].id)} />
            </div>
          </div>
        </div>

        {/* Additional Channels */}
        <div className="mt-12 flex flex-col md:w-[80%] w-full gap-8">
          {channels.slice(1).map((channel, channelIndex) => (
            <div key={channel.id} className="border-b-2 pb-8 mb-4">
              <h3 className="font-poppins text-xl tracking-tight font-semibold text-dowellGreen mb-3">Channel {channelIndex + 2}</h3>
              <div className="flex flex-col gap-8 md:flex-row justify-evenly">
                {/* Channel Name */}
                <div className="md:w-[48%] w-full flex flex-col gap-8">
                  <ScaleInput type="text" placeholder="Enter channel name" label="Specify Channel" value={channel.name} onChange={(e) => handleChannelNameChange(channel.id, e.target.value)} />
                </div>

                {/* Instances */}
                <div className="md:w-[48%] w-full flex flex-col gap-8">
                  {channel.instances.map((instance, instanceIndex) => (
                    <ScaleInput key={instanceIndex} type="text" placeholder={`Instance ${instanceIndex + 1}`} label={`Specify instance ${instanceIndex + 1}`} value={instance} onChange={(e) => handleInstanceNameChange(channel.id, instanceIndex, e.target.value)} />
                  ))}
                </div>
              </div>

              {/* Add/Remove instance buttons */}
              <div className="flex gap-3 mt-4 items-center justify-center">
                <FaPlusCircle className="size-7 text-dowellDeepGreen cursor-pointer" onClick={() => addInstanceToChannel(channel.id)} />
                <FaMinusCircle className="size-7 text-red-500 cursor-pointer" onClick={() => removeInstanceFromChannel(channel.id)} />
              </div>
            </div>
          ))}

          {/* Add/Remove channel buttons */}
          <div className="flex flex-col gap-3 justify-center items-center mt-8">
            <p className="font-poppins font-medium text-sm">Create & Remove Channel</p>
            <div className="flex flex-row gap-3">
              <FaPlusCircle className="size-7 text-dowellDeepGreen cursor-pointer" onClick={createChannel} />
              <FaMinusCircle className="size-7 text-red-500 cursor-pointer" onClick={removeChannel} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configure;
