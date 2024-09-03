import { useState } from "react"
import { Formik } from "formik";
export default function Form(){
// let [formData,setFormData] = useState({
//     fullName: "",
//     userName: "",
// password:""})
const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
    },
  });

let handleInputChange = (event)=>{
    // let fieldName = event.target.name
    // let value = event.target.value
   setFormData((prev) => {
    // prev[fieldName]   = value    
    //computed property name [], first value will evaluted , then 
    // it is used bcz fieldName is a variable
    return {...prev,[event.target.name]:event.target.value}
})
}

let handleSubmit = (event) =>{
event.preventDefault();
setFormData({
    fullName: "",
    userName: "",
    password:""})
}
    return (
        <>
        <form onSubmit={handleSubmit}>
            <label htmlFor="fullName">Full Name: </label>
            <input 
            type="text" 
            placeholder="Enter Your Name" 
            value={formData.fullName} 
            onChange={handleInputChange}
            id="fullName"
            name="fullName"
            />
            <br />
            <br />
             <label htmlFor="userName">User Name: </label>
            <input 
            type="text" 
            placeholder="Enter Your Name" 
            value={formData.userName} 
            onChange={handleInputChange}
            id="userName"
            name="userName"
            />
            <br />
            <br />
             <label htmlFor="password">Password: </label>
            <input 
            type="password" 
            placeholder="Enter Your Password" 
            value={formData.password} 
            onChange={handleInputChange}
            id="password"
            name="password"
            />
            <button>Submit</button>
        </form>
        </>
    )
}