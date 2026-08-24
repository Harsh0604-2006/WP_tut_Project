import { useState } from "react";

function Dashboard(){
    const [crop,setcrop]=useState("Tomato");
   const symptoms = [
        "Yellow Leaves",
        "Brown Spots",
        "Leaf Curling",
        "Wilting",
        "Powdery Coating"
    ];
    const [selectedsymptoms,setSelectedSymptoms]=useState([]);
   
    const handlechange=(e)=>{
        setcrop(e.target.value);
    }

    const  handlechange1=(e)=>{
        const symptom=e.target.value;
if(e.target.checked){
    setselectedsymptoms([...selectedsymptoms,symptom]);
}
else{
    setSelectedSymptoms(selectedsymptoms.filter((item)=>item!==symptom));
}

    }
    return (
        <>
        <div className="dashboard">
            <h1>Smart Crop Health Assistant</h1><br/>
<label htmlFor="crops">Choose the Crop:</label><br/>
<select value={crop} onChange={handlechange}>
    
   <option value="tomato">Tomato</option>
    <option value="Cucumber">Cucumber</option>
    <option value="Onion">Onion</option>

</select>

<h2>Observed Symptoms</h2>
<div >

</div>
        </div>
        </>
    )
}
export default Dashboard;