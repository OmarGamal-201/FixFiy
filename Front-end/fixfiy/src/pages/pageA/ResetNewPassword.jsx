import { useState } from "react";
import "./ResetNewPassword.css";
import React from "react";

function ResetNewPassword() {
  const [form,setForm]=useState({
    
    password:"",
   
    confirmPassword:"",
   
   
  });
  const handleChange = (e) =>{
    console.log(e.target.value);
  };

  const handleSubmit = (e) =>{
    e.preventDefault();
    if (form.password !==form.confirmPassword){
      alert("Password do not match");
      return;
    }
    alert("Sign up successful");

  };

  return (
    
   
   <div className="container">
    <div className="form-wrapper">
      
        <h1 className="page-title">Reset New Password</h1>
      
      <form className="form"
       onSubmit={handleSubmit}>
        
        <label>  Password
          <input name="password" type="password" onChange={handleChange}/>
        </label>
        <label> Confirm Password
          <input name="confirmpassword" type="password" onChange={handleChange}/>
        </label>
        <button>Reset Password </button>

      </form>
    </div>
  </div>
    
  );
}
   

export default ResetNewPassword;