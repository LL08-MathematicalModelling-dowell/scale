import SimpleLocationMap from '../../components/Map/SimpleLocationMap';

function App() {
  return (
    <div className='w-full border-4 m-4 p-4 rounded-lg shadow-md bg-white relative overflow-hidden'>
      <SimpleLocationMap
        workspaceId="66c3a354c0c8c6fbadd5fed4"
        scaleId="66c9d21e9090b1529d108a63"
        apiKey="1b834e07-c68b-4bf6-96dd-ab7cdc62f07f"
      />
    </div>
  );
}

export default App;